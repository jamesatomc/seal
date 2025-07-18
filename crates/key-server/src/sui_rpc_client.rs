// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use std::sync::Arc;

use crypto::ObjectID;
use sui_sdk::{
    error::SuiRpcResult,
    rpc_types::{
        Checkpoint, CheckpointId, DryRunTransactionBlockResponse, SuiObjectDataOptions,
        SuiObjectResponse,
    },
    SuiClient,
};
use sui_types::{dynamic_field::DynamicFieldName, transaction::TransactionData};

use crate::{key_server_options::RetryConfig, metrics::Metrics};

/// Trait for determining if an error is retriable
pub trait RetriableError {
    /// Returns true if the error is transient and the operation should be retried
    fn is_retriable_error(&self) -> bool;
}

impl RetriableError for sui_sdk::error::Error {
    fn is_retriable_error(&self) -> bool {
        match self {
            // Low level networking errors are retriable.
            // TODO: Add more retriable errors here
            sui_sdk::error::Error::RpcError(rpc_error) => {
                matches!(
                    rpc_error,
                    jsonrpsee::core::ClientError::Transport(_)
                        | jsonrpsee::core::ClientError::RequestTimeout
                )
            }
            _ => false,
        }
    }
}

/// Executes an async function with automatic retries for retriable errors
async fn sui_rpc_with_retries<T, E, F, Fut>(
    rpc_config: &RetryConfig,
    label: &str,
    metrics: Option<Arc<Metrics>>,
    mut func: F,
) -> Result<T, E>
where
    E: RetriableError + std::fmt::Debug,
    F: FnMut() -> Fut,
    Fut: std::future::Future<Output = Result<T, E>>,
{
    let mut attempts_remaining = rpc_config.max_retries;
    let mut current_delay = rpc_config.min_delay;

    loop {
        let start_time = std::time::Instant::now();
        let result = func().await;

        // Return immediately on success
        if result.is_ok() {
            if let Some(metrics) = metrics.as_ref() {
                metrics
                    .sui_rpc_request_duration_millis
                    .with_label_values(&[label, "success"])
                    .observe(start_time.elapsed().as_millis() as f64);
            }
            return result;
        }

        // Check if error is retriable and we have attempts left
        if let Err(ref error) = result {
            if error.is_retriable_error() && attempts_remaining > 1 {
                tracing::debug!(
                    "Retrying RPC call to {} due to retriable error: {:?}. Remaining attempts: {}",
                    label,
                    error,
                    attempts_remaining
                );

                if let Some(metrics) = metrics.as_ref() {
                    metrics
                        .sui_rpc_request_duration_millis
                        .with_label_values(&[label, "retriable_error"])
                        .observe(start_time.elapsed().as_millis() as f64);
                }

                // Wait before retrying with exponential backoff
                tokio::time::sleep(current_delay).await;

                // Implement exponential backoff.
                // Double the delay for next retry, but cap at max_delay
                current_delay = std::cmp::min(current_delay * 2, rpc_config.max_delay);
                attempts_remaining -= 1;
                continue;
            }
        }

        tracing::debug!(
            "RPC call to {} failed with error: {:?}. No more attempts remaining.",
            label,
            result.as_ref().err().expect("should be error")
        );

        if let Some(metrics) = metrics.as_ref() {
            metrics
                .sui_rpc_request_duration_millis
                .with_label_values(&[label, "error"])
                .observe(start_time.elapsed().as_millis() as f64);
        }

        // Either non-retriable error or no attempts remaining
        return result;
    }
}

/// Client for interacting with the Sui RPC API.
#[derive(Clone)]
pub struct SuiRpcClient {
    sui_client: SuiClient,
    rpc_retry_config: RetryConfig,
    metrics: Option<Arc<Metrics>>,
}

impl SuiRpcClient {
    pub fn new(
        sui_client: SuiClient,
        rpc_retry_config: RetryConfig,
        metrics: Option<Arc<Metrics>>,
    ) -> Self {
        Self {
            sui_client,
            rpc_retry_config,
            metrics,
        }
    }

    /// Returns a reference to the underlying SuiClient.
    pub fn sui_client(&self) -> &SuiClient {
        &self.sui_client
    }

    /// Returns a clone of the metrics object.
    pub fn get_metrics(&self) -> Option<Arc<Metrics>> {
        self.metrics.clone()
    }

    /// Dry runs a transaction block.
    pub async fn dry_run_transaction_block(
        &self,
        tx_data: TransactionData,
    ) -> SuiRpcResult<DryRunTransactionBlockResponse> {
        sui_rpc_with_retries(
            &self.rpc_retry_config,
            "dry_run_transaction_block",
            self.metrics.clone(),
            || async {
                self.sui_client
                    .read_api()
                    .dry_run_transaction_block(tx_data.clone())
                    .await
            },
        )
        .await
    }

    /// Returns an object with the given options.
    pub async fn get_object_with_options(
        &self,
        object_id: ObjectID,
        options: SuiObjectDataOptions,
    ) -> SuiRpcResult<SuiObjectResponse> {
        sui_rpc_with_retries(
            &self.rpc_retry_config,
            "get_object_with_options",
            self.metrics.clone(),
            || async {
                self.sui_client
                    .read_api()
                    .get_object_with_options(object_id, options.clone())
                    .await
            },
        )
        .await
    }

    /// Returns the latest checkpoint sequence number.
    pub async fn get_latest_checkpoint_sequence_number(&self) -> SuiRpcResult<u64> {
        sui_rpc_with_retries(
            &self.rpc_retry_config,
            "get_latest_checkpoint_sequence_number",
            self.metrics.clone(),
            || async {
                self.sui_client
                    .read_api()
                    .get_latest_checkpoint_sequence_number()
                    .await
            },
        )
        .await
    }

    /// Returns a checkpoint by its sequence number.
    pub async fn get_checkpoint(&self, checkpoint_id: CheckpointId) -> SuiRpcResult<Checkpoint> {
        sui_rpc_with_retries(
            &self.rpc_retry_config,
            "get_checkpoint",
            self.metrics.clone(),
            || async {
                self.sui_client
                    .read_api()
                    .get_checkpoint(checkpoint_id)
                    .await
            },
        )
        .await
    }

    /// Returns the current reference gas price.
    pub async fn get_reference_gas_price(&self) -> SuiRpcResult<u64> {
        sui_rpc_with_retries(
            &self.rpc_retry_config,
            "get_reference_gas_price",
            self.metrics.clone(),
            || async { self.sui_client.read_api().get_reference_gas_price().await },
        )
        .await
    }

    /// Returns an object with the given dynamic field name.
    pub async fn get_dynamic_field_object(
        &self,
        object_id: ObjectID,
        dynamic_field_name: DynamicFieldName,
    ) -> SuiRpcResult<SuiObjectResponse> {
        sui_rpc_with_retries(
            &self.rpc_retry_config,
            "get_dynamic_field_object",
            self.metrics.clone(),
            || async {
                self.sui_client
                    .read_api()
                    .get_dynamic_field_object(object_id, dynamic_field_name.clone())
                    .await
            },
        )
        .await
    }
}

#[cfg(test)]
mod tests {
    use crate::key_server_options::RetryConfig;
    use crate::sui_rpc_client::sui_rpc_with_retries;
    use crate::sui_rpc_client::RetriableError;
    use std::sync::atomic::{AtomicU32, Ordering};
    use std::sync::Arc;
    use std::time::Duration;

    /// Mock error type for testing retry behavior
    #[derive(Debug, Clone)]
    struct MockError {
        is_retriable: bool,
    }

    impl std::fmt::Display for MockError {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            write!(f, "MockError(retriable: {})", self.is_retriable)
        }
    }

    impl std::error::Error for MockError {}

    impl RetriableError for MockError {
        fn is_retriable_error(&self) -> bool {
            self.is_retriable
        }
    }

    /// Mock function that tracks call count and returns errors as configured
    async fn mock_function_with_counter(
        counter: Arc<AtomicU32>,
        fail_count: u32,
        error_type: MockError,
    ) -> Result<String, MockError> {
        let call_count = counter.fetch_add(1, Ordering::SeqCst) + 1;

        if call_count <= fail_count {
            Err(error_type)
        } else {
            Ok(format!("Success on attempt {}", call_count))
        }
    }

    #[tokio::test]
    async fn test_sui_rpc_with_retries_success_first_attempt() {
        let retry_config = RetryConfig {
            max_retries: 3,
            min_delay: Duration::from_millis(10),
            max_delay: Duration::from_millis(100),
        };

        let counter = Arc::new(AtomicU32::new(0));
        let counter_clone = counter.clone();

        let result = sui_rpc_with_retries(&retry_config, "mock_function", None, || async {
            mock_function_with_counter(
                counter_clone.clone(),
                0, // Don't fail any attempts
                MockError { is_retriable: true },
            )
            .await
        })
        .await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "Success on attempt 1");
        assert_eq!(counter.load(Ordering::SeqCst), 1);
    }

    #[tokio::test]
    async fn test_sui_rpc_with_retries_success_after_retriable_failures() {
        let retry_config = RetryConfig {
            max_retries: 3,
            min_delay: Duration::from_millis(10),
            max_delay: Duration::from_millis(100),
        };

        let counter = Arc::new(AtomicU32::new(0));
        let counter_clone = counter.clone();

        let result = sui_rpc_with_retries(&retry_config, "mock_function", None, || async {
            mock_function_with_counter(
                counter_clone.clone(),
                2, // Fail first 2 attempts, succeed on 3rd
                MockError { is_retriable: true },
            )
            .await
        })
        .await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "Success on attempt 3");
        assert_eq!(counter.load(Ordering::SeqCst), 3);
    }

    #[tokio::test]
    async fn test_sui_rpc_with_retries_exhausts_all_retries() {
        let retry_config = RetryConfig {
            max_retries: 3,
            min_delay: Duration::from_millis(10),
            max_delay: Duration::from_millis(100),
        };

        let counter = Arc::new(AtomicU32::new(0));
        let counter_clone = counter.clone();

        let result = sui_rpc_with_retries(&retry_config, "mock_function", None, || async {
            mock_function_with_counter(
                counter_clone.clone(),
                10, // Fail more attempts than max_retries
                MockError { is_retriable: true },
            )
            .await
        })
        .await;

        assert!(result.is_err());
        assert!(result.unwrap_err().is_retriable);
        assert_eq!(counter.load(Ordering::SeqCst), 3); // max_retries attempts
    }

    #[tokio::test]
    async fn test_sui_rpc_with_retries_non_retriable_error() {
        let retry_config = RetryConfig {
            max_retries: 3,
            min_delay: Duration::from_millis(10),
            max_delay: Duration::from_millis(100),
        };

        let counter = Arc::new(AtomicU32::new(0));
        let counter_clone = counter.clone();

        let result = sui_rpc_with_retries(&retry_config, "mock_function", None, || async {
            mock_function_with_counter(
                counter_clone.clone(),
                10, // Fail more attempts than max_retries
                MockError {
                    is_retriable: false,
                }, // Non-retriable error
            )
            .await
        })
        .await;

        assert!(result.is_err());
        assert!(!result.unwrap_err().is_retriable);
        assert_eq!(counter.load(Ordering::SeqCst), 1); // Should only attempt once
    }

    #[tokio::test]
    async fn test_sui_rpc_with_retries_zero_retries() {
        let retry_config = RetryConfig {
            max_retries: 1, // Only one attempt
            min_delay: Duration::from_millis(10),
            max_delay: Duration::from_millis(100),
        };

        let counter = Arc::new(AtomicU32::new(0));
        let counter_clone = counter.clone();

        let result = sui_rpc_with_retries(&retry_config, "mock_function", None, || async {
            mock_function_with_counter(
                counter_clone.clone(),
                10, // Always fail
                MockError { is_retriable: true },
            )
            .await
        })
        .await;

        assert!(result.is_err());
        assert_eq!(counter.load(Ordering::SeqCst), 1); // Should only attempt once
    }

    #[tokio::test]
    async fn test_exponential_backoff_delays() {
        let retry_config = RetryConfig {
            max_retries: 6,
            min_delay: Duration::from_millis(100),
            max_delay: Duration::from_millis(1000),
        };

        let counter = Arc::new(AtomicU32::new(0));
        let counter_clone = counter.clone();

        let start_time = std::time::Instant::now();

        let result = sui_rpc_with_retries(&retry_config, "mock_function", None, || async {
            mock_function_with_counter(
                counter_clone.clone(),
                5, // Fail first 5 attempts, succeed on 6th
                MockError { is_retriable: true },
            )
            .await
        })
        .await;

        let elapsed = start_time.elapsed();

        assert!(result.is_ok());
        assert_eq!(counter.load(Ordering::SeqCst), 6);

        // Expected delays: 100ms, 200ms, 400ms, 800ms, 1000ms (exponential backoff with max cap)
        // Total expected minimum delay: 2500ms
        let expected_min_duration = Duration::from_millis(2500);
        assert!(
            elapsed >= expected_min_duration,
            "Expected at least {:?} but got {:?}",
            expected_min_duration,
            elapsed
        );
    }
}

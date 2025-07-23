// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Box, Button, Card, Container, Flex, Grid, Badge, Text } from '@radix-ui/themes';
import { CreateAllowlist } from './CreateAllowlist';
import { Allowlist } from './Allowlist';
import WalrusUpload from './EncryptAndUpload';
import { useState } from 'react';
import { CreateService } from './CreateSubscriptionService';
import FeedsToSubscribe from './SubscriptionView';
import { Service } from './SubscriptionService';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AllAllowlist } from './OwnedAllowlists';
import { AllServices } from './OwnedSubscriptionServices';
import Feeds from './AllowlistView';
import { 
  LockClosedIcon, 
  TimerIcon, 
  ArrowRightIcon, 
  GearIcon,
  FileTextIcon,
  PersonIcon,
  StarIcon
} from '@radix-ui/react-icons';

function LandingPage() {
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, var(--blue-2) 0%, var(--purple-2) 100%)', 
      borderRadius: '24px', 
      padding: '3rem 2rem', 
      marginBottom: '2rem',
      border: '1px solid var(--blue-6)'
    }}>
      {/* Hero Section */}
      <Flex direction="column" align="center" gap="4" style={{ marginBottom: '3rem' }}>
        <Badge size="2" variant="soft" color="blue" radius="full">
          ✨ Modern Encryption Solutions
        </Badge>
        <Text size="8" weight="bold" align="center" style={{ 
          background: 'linear-gradient(135deg, var(--blue-11) 0%, var(--purple-11) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          Seal Demo Applications
        </Text>
        <Text size="4" color="gray" align="center" style={{ maxWidth: '600px', lineHeight: '1.7' }}>
          Explore cutting-edge encryption patterns with allowlist-based and subscription-based access control
        </Text>
      </Flex>
      
      {/* Feature Cards */}
      <Grid columns="2" gap="6">
        <Card style={{ 
          background: 'white',
          border: '1px solid var(--blue-6)',
          borderRadius: '20px',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }} className="hover:shadow-xl hover:scale-105">
          <Flex direction="column" gap="4" align="center" style={{ height: '100%', padding: '2.5rem' }}>
            <Box style={{ 
              background: 'linear-gradient(135deg, var(--blue-9) 0%, var(--blue-11) 100%)', 
              borderRadius: '50%', 
              padding: '1.5rem',
              boxShadow: '0 8px 24px rgba(0,100,255,0.3)'
            }}>
              <PersonIcon width="32" height="32" color="white" />
            </Box>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <Flex align="center" justify="center" gap="2" style={{ marginBottom: '1rem' }}>
                <Text size="6" weight="bold">Allowlist Access</Text>
                <Badge size="1" variant="soft" color="blue" radius="full">SECURE</Badge>
              </Flex>
              <Text size="3" color="gray" style={{ lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Create exclusive access controls with custom allowlists. Perfect for private content distribution and member-only resources.
              </Text>
              <Flex gap="2" justify="center" wrap="wrap">
                <Badge size="1" variant="outline" color="blue" radius="full">
                  <LockClosedIcon width="10" height="10" />
                  Encrypted
                </Badge>
                <Badge size="1" variant="outline" color="green" radius="full">
                  Access Control
                </Badge>
              </Flex>
            </div>
            <Link to="/allowlist-example" style={{ width: '100%' }}>
              <Button size="3" style={{ 
                width: '100%', 
                background: 'linear-gradient(135deg, var(--blue-9) 0%, var(--blue-11) 100%)', 
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 4px 16px rgba(0,100,255,0.3)'
              }}>
                <Flex align="center" gap="2">
                  Try Allowlist Demo
                  <ArrowRightIcon />
                </Flex>
              </Button>
            </Link>
          </Flex>
        </Card>
        
        <Card style={{ 
          background: 'white',
          border: '1px solid var(--green-6)',
          borderRadius: '20px',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }} className="hover:shadow-xl hover:scale-105">
          <Flex direction="column" gap="4" align="center" style={{ height: '100%', padding: '2.5rem' }}>
            <Box style={{ 
              background: 'linear-gradient(135deg, var(--green-9) 0%, var(--green-11) 100%)', 
              borderRadius: '50%', 
              padding: '1.5rem',
              boxShadow: '0 8px 24px rgba(0,200,100,0.3)'
            }}>
              <StarIcon width="32" height="32" color="white" />
            </Box>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <Flex align="center" justify="center" gap="2" style={{ marginBottom: '1rem' }}>
                <Text size="6" weight="bold">Subscription Service</Text>
                <Badge size="1" variant="soft" color="green" radius="full">PREMIUM</Badge>
              </Flex>
              <Text size="3" color="gray" style={{ lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Monetize your content with time-based subscriptions. Users purchase NFT-based access with automatic expiration.
              </Text>
              <Flex gap="2" justify="center" wrap="wrap">
                <Badge size="1" variant="outline" color="green" radius="full">
                  <TimerIcon width="10" height="10" />
                  Time-based
                </Badge>
                <Badge size="1" variant="outline" color="purple" radius="full">
                  NFT Access
                </Badge>
              </Flex>
            </div>
            <Link to="/subscription-example" style={{ width: '100%' }}>
              <Button size="3" style={{ 
                width: '100%', 
                background: 'linear-gradient(135deg, var(--green-9) 0%, var(--green-11) 100%)', 
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 4px 16px rgba(0,200,100,0.3)'
              }}>
                <Flex align="center" gap="2">
                  Try Subscription Demo
                  <ArrowRightIcon />
                </Flex>
              </Button>
            </Link>
          </Flex>
        </Card>
      </Grid>
    </div>
  );
}

function App() {
  const currentAccount = useCurrentAccount();
  const [recipientAllowlist, setRecipientAllowlist] = useState<string>('');
  const [capId, setCapId] = useState<string>('');
  
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, var(--gray-1) 0%, var(--gray-2) 100%)'
    }}>
      <Container>
        {/* Modern Header */}
        <Flex 
          position="sticky" 
          px="6" 
          py="4" 
          justify="between" 
          align="center"
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: '20px',
            margin: '1rem 0',
            border: '1px solid var(--gray-6)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }}
        >
          <Flex align="center" gap="4">
            <Box style={{ 
              background: 'linear-gradient(135deg, var(--blue-9) 0%, var(--purple-9) 100%)',
              borderRadius: '16px',
              padding: '1rem',
              boxShadow: '0 4px 16px rgba(0,100,255,0.25)'
            }}>
              <LockClosedIcon width="28" height="28" color="white" />
            </Box>
            <div>
              <Text size="7" weight="bold" style={{ 
                background: 'linear-gradient(135deg, var(--blue-11) 0%, var(--purple-11) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Seal Demo
              </Text>
              <Text size="3" color="gray">Modern Encryption Solutions</Text>
            </div>
          </Flex>
          <Box>
            <ConnectButton />
          </Box>
        </Flex>
        
        {/* Modern Info Card */}
        <Card style={{ 
          marginBottom: '2rem', 
          background: 'linear-gradient(135deg, var(--amber-2) 0%, var(--yellow-2) 100%)',
          border: '1px solid var(--amber-6)',
          borderRadius: '20px',
          overflow: 'hidden'
        }}>
          <Flex direction="column" gap="4" style={{ padding: '2rem' }}>
            <Flex align="center" gap="3">
              <Badge size="2" variant="soft" color="amber" radius="full">
                ⚠️ Important Information
              </Badge>
            </Flex>
            
            <Grid columns="2" gap="6">
              <div>
                <Flex align="center" gap="2" style={{ marginBottom: '1rem' }}>
                  <FileTextIcon width="20" height="20" color="var(--amber-11)" />
                  <Text size="4" weight="medium" color="gray">Source Code</Text>
                </Flex>
                <Text size="3" color="gray" style={{ lineHeight: '1.6' }}>
                  Complete implementation available on{' '}
                  <a 
                    href="https://github.com/MystenLabs/seal/tree/main/examples" 
                    style={{ 
                      color: 'var(--blue-11)', 
                      textDecoration: 'none', 
                      fontWeight: '600',
                      borderBottom: '1px solid var(--blue-6)'
                    }}
                  >
                    GitHub →
                  </a>
                </Text>
              </div>
              
              <div>
                <Flex align="center" gap="2" style={{ marginBottom: '1rem' }}>
                  <GearIcon width="20" height="20" color="var(--amber-11)" />
                  <Text size="4" weight="medium" color="gray">Testnet Environment</Text>
                </Flex>
                <Text size="3" color="gray" style={{ lineHeight: '1.6' }}>
                  Requires Testnet wallet with SUI from{' '}
                  <a 
                    href="https://faucet.sui.io/" 
                    style={{ 
                      color: 'var(--blue-11)', 
                      textDecoration: 'none', 
                      fontWeight: '600',
                      borderBottom: '1px solid var(--blue-6)'
                    }}
                  >
                    faucet.sui.io →
                  </a>
                </Text>
              </div>
            </Grid>
            
            <Flex gap="3" wrap="wrap">
              <Badge size="2" variant="soft" color="blue" radius="full">
                📱 Images Only
              </Badge>
              <Badge size="2" variant="soft" color="purple" radius="full">
                ⏰ 1 Epoch Storage
              </Badge>
              <Badge size="2" variant="soft" color="green" radius="full">
                🎯 Demo Purpose
              </Badge>
            </Flex>
            
            <Text size="2" color="gray" style={{ fontStyle: 'italic', lineHeight: '1.6' }}>
              For production use, consider running your own publisher/aggregator as per{' '}
              <a 
                href="https://docs.wal.app/operator-guide/aggregator.html#operating-an-aggregator-or-publisher"
                style={{ 
                  color: 'var(--blue-11)', 
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--blue-6)'
                }}
              >
                Walrus documentation
              </a>
            </Text>
          </Flex>
        </Card>

        {currentAccount ? (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/allowlist-example/*"
                element={
                  <Routes>
                    <Route path="/" element={<CreateAllowlist />} />
                    <Route
                      path="/admin/allowlist/:id"
                      element={
                        <div>
                          <Allowlist
                            setRecipientAllowlist={setRecipientAllowlist}
                            setCapId={setCapId}
                          />
                          <WalrusUpload
                            policyObject={recipientAllowlist}
                            cap_id={capId}
                            moduleName="allowlist"
                          />
                        </div>
                      }
                    />
                    <Route path="/admin/allowlists" element={<AllAllowlist />} />
                    <Route
                      path="/view/allowlist/:id"
                      element={<Feeds suiAddress={currentAccount.address} />}
                    />
                  </Routes>
                }
              />
              <Route
                path="/subscription-example/*"
                element={
                  <Routes>
                    <Route path="/" element={<CreateService />} />
                    <Route
                      path="/admin/service/:id"
                      element={
                        <div>
                          <Service
                            setRecipientAllowlist={setRecipientAllowlist}
                            setCapId={setCapId}
                          />
                          <WalrusUpload
                            policyObject={recipientAllowlist}
                            cap_id={capId}
                            moduleName="subscription"
                          />
                        </div>
                      }
                    />
                    <Route path="/admin/services" element={<AllServices />} />
                    <Route
                      path="/view/service/:id"
                      element={<FeedsToSubscribe suiAddress={currentAccount.address} />}
                    />
                  </Routes>
                }
              />
            </Routes>
          </BrowserRouter>
        ) : (
          <Card style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            background: 'linear-gradient(135deg, var(--blue-2) 0%, var(--purple-2) 100%)',
            border: '1px solid var(--blue-6)',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Flex direction="column" align="center" gap="5">
              <Box style={{ 
                background: 'linear-gradient(135deg, var(--blue-9) 0%, var(--purple-9) 100%)', 
                borderRadius: '50%', 
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0,100,255,0.3)'
              }}>
                <LockClosedIcon width="40" height="40" color="white" />
              </Box>
              <div>
                <Text size="7" weight="bold" style={{ marginBottom: '1rem', display: 'block' }}>
                  Connect Your Wallet
                </Text>
                <Text size="4" color="gray" style={{ maxWidth: '400px', lineHeight: '1.6' }}>
                  To access the Seal demo applications, please connect your wallet using the button above.
                </Text>
              </div>
              <Badge size="3" variant="soft" color="blue" radius="full">
                🔒 Secure Connection Required
              </Badge>
            </Flex>
          </Card>
        )}
      </Container>
    </div>
  );
}

export default App;

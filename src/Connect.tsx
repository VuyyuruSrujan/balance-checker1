import { NetworkId, WalletId, useWallet, type Wallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import * as React from 'react'

export function Connect() {
  const {
    algodClient,
    activeAddress,
    activeNetwork,
    setActiveNetwork,
    transactionSigner,
    wallets
  } = useWallet()

  const [isChecking, setIsChecking] = React.useState(false);
  const [balance, setBalance] = React.useState("-");



  const isConnectDisabled = (wallet: Wallet) => {
    if (wallet.isConnected) {
      return true
    }
    return false
  }

  const setActiveAccount = (event: React.ChangeEvent<HTMLSelectElement>, wallet: Wallet) => {
    const target = event.target
    wallet.setActiveAccount(target.value)
  }

  const checkBalance = async () => {
    try {
      if (!activeAddress) {
        throw new Error('[App] No active account')
      }

      setIsChecking(true)

      const res = await algodClient.accountInformation(activeAddress).do();
      setBalance(`Algo Balance - ${algosdk.microalgosToAlgos(res['amount-without-pending-rewards'])}`)
      console.log(res)
    } catch (error) {
      setBalance(`Failed to Fetch Algo Balance`)
      console.error('[App] Error signing transaction:', error)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div>
      <div className="network-group">
        <h4>
          Current Network: <span className="active-network">{activeNetwork}</span>
        </h4>
        <div className="network-buttons">
          <button
            type="button"
            onClick={() => setActiveNetwork(NetworkId.BETANET)}
            disabled={activeNetwork === NetworkId.BETANET}
          >
            Set to Betanet
          </button>
          <button
            type="button"
            onClick={() => setActiveNetwork(NetworkId.TESTNET)}
            disabled={activeNetwork === NetworkId.TESTNET}
          >
            Set to Testnet
          </button>
          <button
            type="button"
            onClick={() => setActiveNetwork(NetworkId.MAINNET)}
            disabled={activeNetwork === NetworkId.MAINNET}
          >
            Set to Mainnet
          </button>
        </div>
      </div>

      {wallets.map((wallet) => (
        <div key={wallet.id} className="wallet-group">
          <h4>
            {wallet.metadata.name} {wallet.isActive ? '[active]' : ''}
          </h4>

          <div className="wallet-buttons">
            <button
              type="button"
              onClick={() => wallet.connect()}
              disabled={isConnectDisabled(wallet)}
            >
              Connect
            </button>
            <button
              type="button"
              onClick={() => wallet.disconnect()}
              disabled={!wallet.isConnected}
            >
              Disconnect
            </button>
            {wallet.isActive ? (
              <>
                <button type="button" onClick={checkBalance} disabled={isChecking}>
                  {isChecking ? 'Checking Balance...' : 'Check Balance'}
                </button>
                <div>{balance}</div></>
            ) : (
              <button
                type="button"
                onClick={() => wallet.setActive()}
                disabled={!wallet.isConnected}
              >
                Set Active
              </button>
            )}
          </div>

          {wallet.isActive && wallet.accounts.length > 0 && (
            <select onChange={(e) => setActiveAccount(e, wallet)}>
              {wallet.accounts.map((account) => (
                <option key={account.address} value={account.address}>
                  {account.address}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  )
}

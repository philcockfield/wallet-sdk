import WalletSdk, { requestBuilder, requestItem } from '../lib/wallet-sdk'
import { Result } from 'neverthrow'

const sdk = WalletSdk({ dAppId: 'radixDashboard', logLevel: 'DEBUG' })

const transactionManifest = `# Withdraw XRD from account
CALL_METHOD ComponentAddress("account_sim1q02r73u7nv47h80e30pc3q6ylsj7mgvparm3pnsm780qgsy064") "withdraw_by_amount" Decimal("5.0") ResourceAddress("resource_sim1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzqu57yag");

# Buy GUM with XRD
TAKE_FROM_WORKTOP_BY_AMOUNT Decimal("2.0") ResourceAddress("resource_sim1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzqu57yag") Bucket("xrd");
CALL_METHOD ComponentAddress("component_sim1q2f9vmyrmeladvz0ejfttcztqv3genlsgpu9vue83mcs835hum") "buy_gumball" Bucket("xrd");
ASSERT_WORKTOP_CONTAINS_BY_AMOUNT Decimal("3.0") ResourceAddress("resource_sim1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzqu57yag");
ASSERT_WORKTOP_CONTAINS ResourceAddress("resource_sim1qzhdk7tq68u8msj38r6v6yqa5myc64ejx3ud20zlh9gseqtux6");

# Create a proof from bucket, clone it and drop both
TAKE_FROM_WORKTOP ResourceAddress("resource_sim1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzqu57yag") Bucket("some_xrd");
CREATE_PROOF_FROM_BUCKET Bucket("some_xrd") Proof("proof1");
CLONE_PROOF Proof("proof1") Proof("proof2");
DROP_PROOF Proof("proof1");
DROP_PROOF Proof("proof2");

# Create a proof from account and drop it
CALL_METHOD ComponentAddress("account_sim1q02r73u7nv47h80e30pc3q6ylsj7mgvparm3pnsm780qgsy064") "create_proof_by_amount" Decimal("5.0") ResourceAddress("resource_sim1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzqu57yag");
POP_FROM_AUTH_ZONE Proof("proof3");
DROP_PROOF Proof("proof3");

# Return a bucket to worktop
RETURN_TO_WORKTOP Bucket("some_xrd");
TAKE_FROM_WORKTOP_BY_IDS Set<NonFungibleId>(NonFungibleId("0905000000"), NonFungibleId("0907000000")) ResourceAddress("resource_sim1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzqu57yag") Bucket("nfts");

# Create a new fungible resource
CREATE_RESOURCE Enum("Fungible", 0u8) Map<String, String>() Map<Enum, Tuple>() Some(Enum("Fungible", Decimal("1.0")));

# Cancel all buckets and move resources to account
CALL_METHOD ComponentAddress("account_sim1q02r73u7nv47h80e30pc3q6ylsj7mgvparm3pnsm780qgsy064") "deposit_batch" Expression("ENTIRE_WORKTOP");

# Drop all proofs
DROP_ALL_PROOFS;

# Complicated method that takes all of the number types
CALL_METHOD ComponentAddress("component_sim1q2f9vmyrmeladvz0ejfttcztqv3genlsgpu9vue83mcs835hum") "complicated_method" Decimal("1") PreciseDecimal("2");`

const displayResults = (result: Result<any, any>) => {
  document.getElementById('results')!.innerHTML = `<pre>${JSON.stringify(
    result.isErr() ? result.error : result.value,
    null,
    2
  )}</pre>`
}

const clearResults = () => {
  document.getElementById('results')!.innerHTML = ``
}
const accountAddressInputElement = document.getElementById(
  'account-address-input'
)! as HTMLInputElement

document.getElementById('login-btn')!.onclick = async () => {
  clearResults()

  displayResults(
    await sdk.request(requestBuilder(requestItem.login.withoutChallenge()))
  )
}

document.getElementById('account-address-btn')!.onclick = async () => {
  clearResults()

  const result = await sdk.request(
    requestBuilder(
      requestItem.oneTimeAccounts.withoutProofOfOwnership(
        accountAddressInputElement.value
          ? parseInt(accountAddressInputElement.value, 10)
          : undefined
      )
    )
  )

  displayResults(result)
}

document.getElementById('persona-data-btn')!.onclick = async () => {
  clearResults()

  const result = await sdk.request(
    requestBuilder(requestItem.oneTimePersonaData('firstName', 'email'))
  )

  displayResults(result)
}

document.getElementById('send-tx-btn')!.onclick = async () => {
  clearResults()

  const result = await sdk.sendTransaction({
    transactionManifest,
    version: 1,
  })

  displayResults(result)
}

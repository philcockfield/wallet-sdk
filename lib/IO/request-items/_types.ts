export type AccountAddress = {
  label: string
  address: string
  appearanceId: number
}
export type OwnershipProof = { challenge: string; signature: string }
export type AccountAddressWithOwnershipProof = OwnershipProof & {
  account: AccountAddress
}
export type PersonaDataField = { field: string; value: string }

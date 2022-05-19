import ethers from 'ethers'
import type { TypedDataSigner } from "@ethersproject/abstract-signer";

type VoucherSignatureRequest = {
  domain: string
  version: string
  key: string 
  price: string | ethers.BigNumber
  from: string 
  to: string
  uri: string  
  giveaway: boolean
  expiration: number
}

export default class SigningService {
  constructor(private contract: ethers.Contract, private signer: (ethers.Signer & TypedDataSigner)) {
    this.contract = contract
    this.signer = signer
  }
  
  async signVoucher(signatureRequest: VoucherSignatureRequest) {
    console.log(`Request received to sign a voucher: \n${JSON.stringify(signatureRequest)}.`)
    const domain = {
      name: signatureRequest.domain,
      version: signatureRequest.version,
      verifyingContract: this.contract.address,
      chainId: await this.signer.getChainId(),
    }
    console.log(`Preparing signature context: \n'${JSON.stringify(domain)}'.\n\n`)
    let price = 
      typeof signatureRequest.price === 'string' 
        ? ethers.utils.parseEther(signatureRequest.price)
        : signatureRequest.price;
    const voucher = { 
        key: signatureRequest.key, 
        price: price, 
        from: signatureRequest.from, 
        to: signatureRequest.to, 
        uri: signatureRequest.uri,
        giveaway: signatureRequest.giveaway,
        expiration: signatureRequest.expiration }
    console.log(`Preparing voucher for signing: \n'${JSON.stringify(voucher)}'.\n\n`)
    const types = {
      Voucher: [
        {name: "key", type: "string"},
        {name: "price", type: "uint256"},
        {name: "from", type: "address"},
        {name: "to", type: "address"},
        {name: "uri", type: "string"},  
        {name: "giveaway", type: "bool"},
        {name: "expiration", type: "uint256"},
      ]
    }
    const signature = await this.signer._signTypedData(domain, types, voucher)
    const result = { ...voucher, signature }
    console.log(`Signature created: \n'${JSON.stringify(result)}'.\n\n`)
    return result
  }
}
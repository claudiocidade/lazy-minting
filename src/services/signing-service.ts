import ethers from 'ethers'

type VoucherSignatureRequest = {
  domain: string
  version: string
  key: string 
  price: string
  from: string 
  to: string
  uri: string  
}

export const signVoucher = async (
    targetNetwork: string = 'mainnet',
    contractAddress: string,
    signerPrivateKey: string,
    signatureRequest: VoucherSignatureRequest
) => {
    const provider = ethers.getDefaultProvider(targetNetwork);
    console.log(`Provider for network '${targetNetwork}' created.`)
    const signer = new ethers.Wallet(signerPrivateKey, provider)
    const domain = {
      name: signatureRequest.domain,
      version: signatureRequest.version,
      verifyingContract: contractAddress,
      chainId: await signer.getChainId(),
    }
    console.log(`Preparing signature context: \n'${JSON.stringify(domain)}'.\n\n`)
    const voucher = { 
        assetId: signatureRequest.key, 
        price: ethers.utils.parseEther(signatureRequest.price), 
        from: signatureRequest.from, 
        to: signatureRequest.to, 
        uri: signatureRequest.uri }
    console.log(`Preparing voucher for signing: \n'${JSON.stringify(voucher)}'.\n\n`)
    const types = {
      Voucher: [
        {name: "assetId", type: "string"},
        {name: "price", type: "uint256"},
        {name: "from", type: "address"},
        {name: "to", type: "address"},
        {name: "uri", type: "string"},  
      ]
    }
    const signature = await signer._signTypedData(domain, types, voucher)
    const result = { ...voucher, signature }
    console.log(`Signature created: \n'${JSON.stringify(result)}'.\n\n`)
    return result
}
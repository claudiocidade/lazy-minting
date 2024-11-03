import type { TypedDataSigner } from '@ethersproject/abstract-signer';
import { ethers } from 'ethers';

type VoucherSignatureRequest = {
  network: string;
  domain: string;
  version: string;
  key: string;
  price: string | ethers.BigNumber;
  from: string;
  to: string;
  uri: string;
  giveaway: boolean;
  deadline: number;
};

export default class SigningService {
  constructor(
    private contractAddress: string,
    private signer: ethers.Signer & TypedDataSigner
  ) {
    this.contractAddress = contractAddress;
    this.signer = signer;
  }

  async signVoucher(signatureRequest: VoucherSignatureRequest) {
    console.log(
      `Request received to sign a voucher: \n${JSON.stringify(
        signatureRequest
      )}.`
    );
    const provider = ethers.getDefaultProvider(signatureRequest.network);
    const block = await provider.getBlock('latest');
    // each block takes between 12 and 14 seconds (5 blocks per minute on average)
    // so the deadline is calculated by multipliying the number of blocks
    const voucherDeadline = block.number + 5 /* blocks */ * signatureRequest.deadline /* minutes */;

    const domain = {
      name: signatureRequest.domain,
      version: signatureRequest.version,
      verifyingContract: this.contractAddress,
      chainId: await this.signer.getChainId(),
    };
    console.log(
      `Preparing signature context: \n'${JSON.stringify(domain)}'.\n\n`
    );
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
      deadline: voucherDeadline,
    };
    console.log(
      `Preparing voucher for signing: \n'${JSON.stringify(voucher)}'.\n\n`
    );
    const types = {
      Voucher: [
        { name: 'key', type: 'string' },
        { name: 'price', type: 'uint256' },
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'uri', type: 'string' },
        { name: 'giveaway', type: 'bool' },
        { name: 'deadline', type: 'uint256' },
      ],
    };
    const signature = await this.signer._signTypedData(domain, types, voucher);
    const result = { ...voucher, signature };
    console.log(`Signature created: \n'${JSON.stringify(result)}'.\n\n`);
    return result;
  }
}

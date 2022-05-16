import { expect } from "chai";
import { ethers } from "hardhat";
import { signVoucher } from '@/services/signing-service';

import "@nomiclabs/hardhat-waffle";

async function deploy() {
  const [signer, creator, buyer] = await ethers.getSigners()

  let factory = await ethers.getContractFactory("MaximinderContract")
  const contract = await factory.deploy()
  // a domain information to secure vouchers
  const domain = "LMDEV"

  return {
    signer,
    creator,
    buyer,
    contract,
    domain
  }
}

describe("MaximinderContract", function() {
  it("Should deploy", async function() {
    const contract = 
      await (await ethers
        .getContractFactory("MaximinderContract"))
        .deploy();
    await contract.deploy();
    await contract.deployed();
  });

  it("Should redeem an NFT from a signed voucher", async function() {
    const { creator, buyer, contract, domain } = await deploy()
  
    const voucher = await signVoucher(
      'rinkeby', 
      contract.address,
      '',
      {
        domain: domain,
        version: "1",
        key: "A12345",
        price: "0.012",
        from: creator.address, 
        to: buyer.address,
        uri: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"  
      }
    )

    await expect(contract.redeem(5, voucher))
      .to.emit(contract, 'Transfer')  // transfer from null address to minter
      .withArgs('0x0000000000000000000000000000000000000000', voucher.from, 1)
      .and.to.emit(contract, 'Transfer') // transfer from minter to redeemer
      .withArgs(voucher.from, voucher.to, 1);
  });
});
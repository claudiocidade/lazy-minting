import { expect } from "chai";
import { ethers } from "hardhat";
import { signVoucher } from '../src/services/signing-service';

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

  // it("Should fail to redeem an NFT that's already been claimed", async function() {
  //   const { contract, buyerContract, buyer, creator } = await deploy()

  //   const mintService = new MintService( contract, creator )
  //   const voucher = await mintService.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi")

  //   await expect(buyerContract.redeem(buyer.address, voucher))
  //     .to.emit(contract, 'Transfer')  // transfer from null address to creator
  //     .withArgs('0x0000000000000000000000000000000000000000', creator.address, voucher.tokenId)
  //     .and.to.emit(contract, 'Transfer') // transfer from creator to buyer
  //     .withArgs(creator.address, buyer.address, voucher.tokenId);

  //   await expect(buyerContract.redeem(buyer.address, voucher))
  //     .to.be.revertedWith('ERC721: token already minted')
  // });

  // it("Should fail to redeem an NFT voucher that's signed by an unauthorized account", async function() {
  //   const { contract, buyerContract, buyer, creator } = await deploy()

  //   const signers = await ethers.getSigners()
  //   const rando = signers[signers.length-1];
    
  //   const mintService = new MintService( contract, rando )
  //   const voucher = await mintService.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi")

  //   await expect(buyerContract.redeem(buyer.address, voucher))
  //     .to.be.revertedWith('Signature invalid or unauthorized')
  // });

  // it("Should fail to redeem an NFT voucher that's been modified", async function() {
  //   const { contract, buyerContract, buyer, creator } = await deploy()

  //   const signers = await ethers.getSigners()
  //   const rando = signers[signers.length-1];
    
  //   const mintService = new MintService( contract, rando )
  //   const voucher = await mintService.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi")
  //   voucher.tokenId = 2
  //   await expect(buyerContract.redeem(buyer.address, voucher))
  //     .to.be.revertedWith('Signature invalid or unauthorized')
  // });

  // it("Should fail to redeem an NFT voucher with an invalid signature", async function() {
  //   const { contract, buyerContract, buyer, creator } = await deploy()

  //   const signers = await ethers.getSigners()
  //   const rando = signers[signers.length-1];
    
  //   const mintService = new MintService( contract, rando )
  //   const voucher = await mintService.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi")

  //   const dummyData = ethers.utils.randomBytes(128)
  //   voucher.signature = await creator.signMessage(dummyData)
    
  //   await expect(buyerContract.redeem(buyer.address, voucher))
  //     .to.be.revertedWith('Signature invalid or unauthorized')
  // });

  // it("Should redeem if payment is >= minPrice", async function() {
  //   const { contract, buyerContract, buyer, creator } = await deploy()

  //   const mintService = new MintService( contract, creator )
  //   const minPrice = ethers.constants.WeiPerEther // charge 1 Eth
  //   const voucher = await mintService.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", minPrice)

  //   await expect(buyerContract.redeem(buyer.address, voucher, { value: minPrice }))
  //     .to.emit(contract, 'Transfer')  // transfer from null address to creator
  //     .withArgs('0x0000000000000000000000000000000000000000', creator.address, voucher.tokenId)
  //     .and.to.emit(contract, 'Transfer') // transfer from creator to buyer
  //     .withArgs(creator.address, buyer.address, voucher.tokenId)
  // })

  // it("Should fail to redeem if payment is < minPrice", async function() {
  //   const { contract, buyerContract, buyer, creator } = await deploy()

  //   const mintService = new MintService( contract, creator )
  //   const minPrice = ethers.constants.WeiPerEther // charge 1 Eth
  //   const voucher = await mintService.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", minPrice)

  //   const payment = minPrice.sub(10000)
  //   await expect(buyerContract.redeem(buyer.address, voucher, { value: payment }))
  //     .to.be.revertedWith('Insufficient funds to redeem')
  // })

  // it("Should make payments available to creator for withdrawal", async function() {
  //   const { contract, buyerContract, buyer, creator } = await deploy()

  //   const mintService = new MintService( contract, creator )
  //   const minPrice = ethers.constants.WeiPerEther // charge 1 Eth
  //   const voucher = await mintService.createVoucher(1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", minPrice)
    
  //   // the payment should be sent from the buyer's account to the contract address
  //   await expect(await buyerContract.redeem(buyer.address, voucher, { value: minPrice }))
  //     .to.changeEtherBalances([buyer, contract], [minPrice.mul(-1), minPrice]) 

  //   // creator should have funds available to withdraw
  //   expect(await contract.availableToWithdraw()).to.equal(minPrice)

  //   // withdrawal should increase creator's balance
  //   await expect(await contract.withdraw())
  //     .to.changeEtherBalance(creator, minPrice)

  //   // creator should now have zero available
  //   expect(await contract.availableToWithdraw()).to.equal(0)
  // })
});
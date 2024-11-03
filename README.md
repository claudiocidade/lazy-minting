# MaximinderContract

The `MaximinderContract` is an Ethereum smart contract that facilitates a decentralized marketplace for non-fungible tokens (NFTs) with lazy minting capabilities. This contract leverages the ERC721 standard, EIP712 signature structure, and OpenZeppelin's `AccessControl` and `Ownable` modules to securely manage token creation, transactions, and royalty distributions.

## Features

- **Lazy Minting**: Allows unminted NFTs to be represented by signed vouchers, which can be redeemed for actual NFTs.
- **Voucher-based NFT Creation**: Ensures NFT minting occurs only when a voucher is redeemed, reducing gas fees.
- **Royalty Support**: Automatically assigns royalty fees to creators upon each secondary sale.
- **Secure Signature Verification**: Uses EIP712 standard for securely verifying voucher signatures.
- **Access Control**: Ensures restricted access to critical functions, enhancing security.

## Overview

This contract is designed for the **Maximinder Marketplace**, a platform for creators to mint, sell, and transfer ownership of NFTs while retaining control over initial and secondary sales.

### Built With

- **Solidity v0.8.0**
- **OpenZeppelin Contracts**: For secure implementation of ERC721, `AccessControl`, `Ownable`, and other utility libraries.
- **Hardhat**: For local development, testing, and deployment.

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [Contract Functions](#contract-functions)
4. [Events](#events)
5. [Security Considerations](#security-considerations)
6. [License](#license)

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/ksd-mx/nft-marketplace-contract/contracts/MaximinderContract.git
   cd MaximinderContract
   ```

2. Clone this repository:

   ```bash
   npm install
   ```

3. Clone this repository:

   ```bash
   npx hardhat compile
   ```

## Deployment

Deploy the contract with the required parameters:

  ```javascript
  const signerAddress = { signer wallet address here }
  const contractName = "MarketplaceContract";
  const signatureDomain = "LM";
  const signatureVersion = "1";
  const ContractFactory = await ethers.getContractFactory(contractName);
  const contract = await ContractFactory.deploy(signerAddress, signatureDomain, signatureVersion);
  await contract.deployed();
  console.log("Contract deployed to:", contract.address);
  ```

## Example Interaction

To redeem an NFT, call the redeem function with a valid signed voucher:

  ```javascript
  await contract.redeem(platformFee, voucher, { value: ethers.utils.parseEther("0.1") });
  ```

## Contract Functions

Constructor

  ```javascript
  constructor(address signer, string memory domain, string memory version);
  ```

## Example Interaction

To redeem an NFT, call the redeem function with a valid signed voucher:

  ```javascript
  await contract.redeem([], voucher, { value: ethers.utils.parseEther("0.1") });
  ```

## Contract Functions

### Constructor

Initializes the contract with a voucher signer, domain, and version to uniquely identify the voucher signature.

```solidity constructor(address signer, string memory domain, string memory version); ```

### changeSigner

Updates the voucher signer. Only callable by the contract owner.

```solidity function changeSigner(address newSigner) external onlyOwner; ```

### royaltyInfo

Returns the royalty payment details for a specific sale.

```solidity function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount); ```

### redeem

Redeems a signed voucher for an NFT, transferring ownership and processing payment if applicable.

```solidity function redeem(uint8 platformFee, Voucher calldata voucher) public payable returns (uint256); ```

### supportsInterface

Checks if the contract implements a specific interface.

```solidity function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool); ```

## Voucher Structure

The voucher contains the following fields:

key - Unique asset identifier.
price - Minimum acceptable sale price.
from - Address of the creator.
to - Address of the buyer.
uri - Metadata URI for the NFT.
giveaway - Indicates whether the NFT is a giveaway (no fees applied).
deadline - Expiration timestamp for the voucher.
signature - Signed data for verification.

## Voucher Issuance Rules

The voucher issuance service follows strict rules to ensure the security and validity of each voucher issued. These rules are crucial for consumer developers to understand:

1. Voucher Expiration:

Each voucher includes an expiration, determined by the current block number plus a number of blocks based on a specified duration in minutes.
Important: This expiration prevents vouchers from being reused after a certain time, safeguarding against stale voucher redemption attempts. Developers should ensure the voucher is redeemed within the specified timeframe.

2. Domain Context:

1The voucher signing service establishes a unique EIP-712 domain for each contract and deployment.
This domain context includes the contractAddress, domain, version, and the chainId from the signer.
Important: This domain information must match the contract’s context on-chain to validate the voucher. Any mismatch (e.g., due to a contract redeployment) will invalidate previously issued vouchers.

3. Voucher Fields and Types:

Each voucher contains specific fields: key, price, from (creator), to (buyer), uri (metadata URI), giveaway (boolean flag), and deadline.
The price field is validated and converted to a BigNumber to ensure precise and secure pricing.
Important: Developers should ensure accurate data in these fields to prevent validation errors and ensure smooth redemption.

4. Price Conversion:

The price field is parsed as a BigNumber if it's passed as a string. This ensures compatibility with Ether values and avoids rounding issues.
Important: This conversion is essential for ensuring compatibility with the smart contract’s redeem function, which expects price to be in wei.

5. Signature Generation:

The signing service generates an EIP-712 signature for each voucher based on the domain context and voucher fields.
This signature is attached to the voucher and is required to redeem the voucher within the MaximinderContract.
Important: Only the designated signer with the MINTER_ROLE should be authorized to sign vouchers, ensuring that only authorized entities can issue redeemable vouchers.

## Events

itemSold(uint256 tokenId, string key, address from, address to, bool giveaway, uint256 soldPrice, string tokenUri)

## Security Considerations

- [Voucher Signature]: (Make sure to securely store the private key for signing vouchers to prevent unauthorized minting.)
- [Voucher Expiry]: (Vouchers are time-sensitive; ensure that expired vouchers cannot be reused.)
- [Platform Fee Enforcement]: (Only allow non-giveaway vouchers if the platform fee is at least 5%.)
- [Royalty Handling]: (This contract automatically assigns a 5% royalty to the creator on secondary sales.)

## License
This project is licensed under the MIT License - see the LICENSE file for details. ```

Copy this directly into your README.md file, and it should retain the correct formatting. Let me know if this resolves the issue!

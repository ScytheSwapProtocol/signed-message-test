import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { SingleTXPrimitive, IERC20 } from '../typechain'
import { deploySingleTXPrimitive } from "./util";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers, network } from 'hardhat'
import { BigNumber, utils, Signer, Wallet } from "ethers";

chai.use(solidity)
const { expect } = chai

import * as _env from './constants';

// ================
//

async function signCommand(signer:Wallet, encodedCmd:string) {
    let saltHash = "0x0123456789012345678901234567890123456789012345678901234567890123";
    let payload = ethers.utils.defaultAbiCoder.encode
    ([ "bytes32", "bytes" ], [ saltHash, encodedCmd ]);

    let payloadHash = ethers.utils.keccak256(payload);

    let signature =
        await signer.signMessage(ethers.utils.arrayify(payloadHash));
        
    let sigSplit = ethers.utils.splitSignature(signature);

    expect(signer.address).to.equal(
        ethers.utils.verifyMessage(ethers.utils.arrayify(payloadHash), sigSplit));

    return {
        signature: {
            r: sigSplit.r,
            s: sigSplit.s,
            v: sigSplit.v
        },
        salt: saltHash,
        command: encodedCmd,
        signerAddress: signer.address
    }
}

let snapshotId:string

const payForAbi = ["function payFor()"]

describe('SingleTXPrimitive', () => {
    let stxp:SingleTXPrimitive
    let defaultAccount:SignerWithAddress
    let owner:SignerWithAddress
    let treasury:SignerWithAddress
    let stranger:SignerWithAddress
    let strangerW:Wallet
    let face = new ethers.utils.Interface(payForAbi)
    const USDTShark = "0x5754284f345afc66a98fbb0a0afe71e0f007b949"
    const USDTContractAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7"
    let USDTAccount:Signer

    before(async() => {
        [defaultAccount, owner, stranger, treasury] = await ethers.getSigners()

        strangerW = Wallet.createRandom()
 
        stxp = await deploySingleTXPrimitive({
            deployer: owner,
            relayer: treasury.address
        })

        await network.provider.request({
             method: "hardhat_impersonateAccount",
             params: [USDTShark]})

        USDTAccount = await ethers.provider.getSigner(USDTShark)

        // fund USDTShark with ETH
        await defaultAccount.sendTransaction
        ({to: USDTShark,
          value: _env.OneEther.mul(100)})        
    })
    
    it('accepts a signed message', async () => {
        // verify that isPaidFor returns false
        expect(await stxp.connect(defaultAccount).isPaidFor()).to.equal(false)
    
        // create and sign a tx that originates with `strangerW`
        // and asks to call stxp.payFor()
        const encodedFnData =
              face.encodeFunctionData("payFor")

        const cmd = await signCommand(strangerW, encodedFnData)

        let tx =
            await stxp.connect(treasury)
            .executeDelegatedTX(cmd.salt,
                                cmd.command,
                                cmd.signerAddress,
                                cmd.signature.v,
                                cmd.signature.r,
                                cmd.signature.s)

        expect(await stxp.connect(defaultAccount).isPaidFor()).to.equal(true)            
    })
   
})

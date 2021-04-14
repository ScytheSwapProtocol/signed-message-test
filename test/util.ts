import { ethers } from "hardhat";
import { SingleTXPrimitive, SingleTXPrimitive__factory } from "../typechain";
import { BigNumberish } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

//require("@nomiclabs/hardhat-ethers");

interface SingleTXPrimitiveDeployProps {
    deployer: SignerWithAddress;
    relayer: string;
}

export const deploySingleTXPrimitive =
async (deployProps: SingleTXPrimitiveDeployProps): Promise<SingleTXPrimitive> => {
  const stxpFactory = (await
   ethers.getContractFactory('SingleTXPrimitive',
                             deployProps.deployer)) as SingleTXPrimitive__factory
        
        const stxp = await stxpFactory.deploy(deployProps.relayer)

        await stxp.deployed()

        return stxp
    }

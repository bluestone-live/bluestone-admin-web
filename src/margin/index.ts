import { BigNumber } from "ethers"

const exp = BigNumber.from(10).pow(18)
export const marginCollateralCoverageRatio = BigNumber.from(100).mul(exp)
import { BigNumber } from "ethers"

const exp = BigNumber.from(10).pow(18)
// Margin Ratio = 200%
export const marginCollateralCoverageRatio = exp.mul(2)
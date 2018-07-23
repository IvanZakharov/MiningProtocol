const MiningProtTokenContract = artifacts.require("./MiningProtToken.sol");
const MNPRTTokenContract = artifacts.require("./MNPRTToken.sol");
const ManagementContract = artifacts.require("./ManagementMock.sol");

module.exports = async function(deployer, network, accounts) {
    let fund = accounts[9];
    let dao = accounts[8];
    let holder1 = accounts[5];
    let holder2 = accounts[1];

    deployer.then(async () => {
        await deployer.deploy(MiningProtTokenContract);
        await deployer.deploy(MNPRTTokenContract, holder1, holder2);

        await deployer.link(MNPRTTokenContract, ManagementContract);
        await deployer.link(MiningProtTokenContract, ManagementContract);
        return await deployer.deploy(ManagementContract, MiningProtTokenContract.address, MNPRTTokenContract.address, dao, fund);
    });

    console.log('Contracts are deployed!');
};

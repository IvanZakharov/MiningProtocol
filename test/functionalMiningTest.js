let MiningProtTokenContract = artifacts.require("./MiningProtToken.sol");
let MNPRTTokenContract = artifacts.require("./MNPRTToken.sol");
let ManagementContract = artifacts.require("./ManagementMock.sol");
import assertRevert from '../test/assertRevert';
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('ManagementContract', async (accounts) => {
  let minerToken;
  let tokenERC20;
  let manager;
  let managerContract;
  let erc721Amount = 10; //Max amount for onetime buying is 41
  let erc20Amount = erc721Amount * 10000 * 10 ** 18;
  let additional = 5;  //Max amount for receiving 7 days' reward is 490
  let imax = 1;

  let d = new Date();
  let year = d.getUTCFullYear();
  let month = d.getUTCMonth();
  let day = d.getUTCDate();

  let time = Date.UTC(year,month,day,0,0,0,0);
  let startOfDay = time/1000;
  let congress = accounts[8];

    beforeEach(async function() {
        managerContract = await ManagementContract.deployed();
        tokenERC20 = await MiningProtTokenContract.deployed();
        minerToken = await MNPRTTokenContract.deployed();
    });

    it('should test zero tokensToMiners at getReward', async function() {
        let miningTokens = await managerContract.miningTokensOf(accounts[1], {from: accounts[2]});
        await assertRevert(managerContract.getReward(miningTokens, {from: accounts[1]}));
    });

    it('should return the correct totalSupply erc20 after letruction', async function() {
        let totalSupply_ = await tokenERC20.totalSupply();
        let pendingSupply = 0;
        assert.equal(totalSupply_.valueOf(),  pendingSupply);
    });

    it('should return the owner', async function() {
        let owner = await tokenERC20.owner.call();
        assert.equal(owner.valueOf(), accounts[0]);
    });

    it('should set and return the manager of erc20', async function() {
        await tokenERC20.setManager(accounts[1]);
        manager = await tokenERC20.manager.call();
        assert.equal(manager.valueOf(), accounts[1]);
    });

    it('should return the correct totalSupply erc721 after letruction', async function() {
        let totalSupply_ = await minerToken.totalSupply();
        let pendingSupply = 20;
        assert.equal(totalSupply_.valueOf(), pendingSupply);
    });

    it('should return correct balance', async function() {
        let amount = erc20Amount;
        await tokenERC20.setManager(accounts[1]);
        await tokenERC20.mint(accounts[2], amount, {from: accounts[1]});
        let _balance = await tokenERC20.balanceOf(accounts[2]);

        await minerToken.setManager(managerContract.address);

        let weekAgoDate = Date.UTC(year,month,day -7 ,0,0,0,0);
        let num = 0;

        for (let i = 0; i < imax; i++)
            await managerContract.__multiMint(accounts[0], additional, {from :accounts[0] });

        let arr = new Array();

        for (let i = 0; i < 10; i++)
          arr.push(i);

        for (let i = 20; i < imax * additional+20; i++)
          arr.push(i);

        await managerContract.__updateTokensTime(arr, 0);


        let _tokenTime = await managerContract.getLastRewardTime([0]);

        assert.equal(num, _tokenTime.valueOf());

        assert.equal(_balance.valueOf(), amount);
    });

    it('should return correct tokenERC20 address', async function() {
        let fundInContract = accounts[3];
        await managerContract.setFund(fundInContract);
        let pendingFund = await managerContract.fund.call();
        assert.equal(pendingFund.valueOf(), fundInContract);
        await tokenERC20.setManager(managerContract.address);
        let pendingManager = await tokenERC20.manager.call();
        assert.equal(pendingManager.valueOf(), managerContract.address);

        await minerToken.setManager(managerContract.address);
        let pendingManager2 = await minerToken.manager.call();
        assert.equal(pendingManager2.valueOf(), managerContract.address);

        await managerContract.setToken(tokenERC20.address);
        let pendingToken = await managerContract.token.call();
        assert.equal(pendingToken.valueOf(), tokenERC20.address);
    });

    it('should return correct allowance value', async function() {
        let amount = erc20Amount;
        await tokenERC20.approve(managerContract.address, amount, {from: accounts[2]});
        let _allowance = await tokenERC20.allowance(accounts[2], managerContract.address);
        assert.equal(_allowance.valueOf(), amount);
    });

    it('should return correct erc721 balance', async function() {
        await managerContract.buyMNPRT({from: accounts[2]});
        let _balance = await minerToken.balanceOf(accounts[2]);
        assert.equal(_balance.valueOf(), erc721Amount);
    });

    it('should return correct last reward amount', async function() {
        let tokenSupply = await tokenERC20.totalSupply();
        await managerContract.mining();

        let lastRewardAmount = await managerContract.__getTimeReward(1);
        let miningTokenSupply = await minerToken.totalSupply();
        assert.equal(Math.round(lastRewardAmount.valueOf()/10**18), Math.round((10 ** 27 - tokenSupply) / 10000 * 4 / miningTokenSupply.valueOf() / 10 ** 18));
    });

    it('should return correct reward amount on check', async function() {
        let miningTokens = await managerContract.miningTokensOf(accounts[0]);
        let checkedReward = await managerContract.checkReward(miningTokens);
        let lastRewardAmount = await managerContract.__getTimeReward(1);
        let evalAmount = lastRewardAmount.valueOf() * miningTokens.length;
        assert.equal(Math.round(evalAmount/10**18), Math.round(checkedReward.valueOf()/10**18));
    });

    it('should return correct balance after getting reward', async function() {
        let _miningTokensOf = await managerContract.miningTokensOf(accounts[0]);
        console.log("Getting reward for " + _miningTokensOf.length + " mining tokens");
        await managerContract.getReward(_miningTokensOf, {from: accounts[0]});
        let _balance = await tokenERC20.balanceOf(accounts[0]);
        let _tokensPerMiningToken = await managerContract.getMiningReward(1);
        let _erc721Amount = erc721Amount + (imax * additional);
        assert.equal(Math.round((_tokensPerMiningToken.valueOf() * (imax * additional)) / 10**18), Math.round(_balance.valueOf() / 10**18));
    });

    it('should send correct reward to contributors by admin', async function() {
        let miningTokens = await managerContract.miningTokensOf(accounts[1]);
        console.log("Sending reward for " + miningTokens.length + " mining tokens");
        await managerContract.sendReward(miningTokens, {from: accounts[0]});
        let _balance = await tokenERC20.balanceOf(accounts[1]);
        let _tokensPerMiningToken = await managerContract.getMiningReward(1);
        assert.equal(Math.round((_tokensPerMiningToken.valueOf() * (miningTokens.length)) / 10**18), Math.round(_balance.valueOf() / 10**18));
    });

    it('should prevent repeat of sending reward to contributors by admin', async function() {
        let miningTokens = await managerContract.miningTokensOf(accounts[1]);
        let balanceBefore = await tokenERC20.balanceOf(accounts[1]);
        await managerContract.sendReward(miningTokens, {from: accounts[0]});
        let balancePast = await tokenERC20.balanceOf(accounts[1]);
        assert.equal(balanceBefore.valueOf(), balancePast.valueOf());
    });

    it('should return correct reward amount on check after getting reward', async function() {
        let miningTokens = await managerContract.miningTokensOf(accounts[0]);
        let checkedReward = await managerContract.checkReward(miningTokens);
        assert.equal(0, Math.round(checkedReward.valueOf()/10**18));
    });

    it('should revert already taken reward', async function() {
        let tokenIds = await managerContract.miningTokensOf(accounts[0], {from: accounts[0]});
        await assertRevert(managerContract.getReward(tokenIds, {from: accounts[0]}));

    });

    it('should revert incorrect address', async function() {
        await assertRevert(managerContract.setFund(0));
        await assertRevert(managerContract.setToken(0));
        await assertRevert(managerContract.setMiningToken(0));
        await assertRevert(managerContract.setDao(0));
    });

    it('should revert already executed mining', async function() {
        await assertRevert(managerContract.mining());
    });

    it('should revert MNPRT buying', async function() {

        await tokenERC20.approve(managerContract.address, 100, {from: accounts[3]});
        await assertRevert(managerContract.buyMNPRT({from: accounts[3]}));
        await tokenERC20.approve(managerContract.address, 100000* 10 ** 18, {from: accounts[4]});
        await assertRevert(managerContract.buyMNPRT({from: accounts[4]}));
    });

    it('should revert incorrect owner', async function() {
        await assertRevert(managerContract.setFund(accounts[2], {from: accounts[2]}));
    });

    it('should revert fake dao manipulation', async function() {
          await assertRevert(managerContract.asyncSend(accounts[2], 10 * 10 ** 18, 0, {from: accounts[2]}));
    });

    it('should set addresses', async function() {
        await managerContract.setMiningToken(minerToken.address);
        await managerContract.setDao(congress);
    });

    it('should prevent very high price', async function() {
        await managerContract.__setStartTime(0);
        let _price = await managerContract.getPrice(new Date()/1000);
        assert.equal(_price.valueOf(), 50000 * 10 **18);
    });

    it('should prevent incorrect addresses at manager letructor', async function() {
        await assertRevert(ManagementContract.new(0, 0, 0, 0));
        await assertRevert(ManagementContract.new(accounts[1], 0, 0, 0));
        await assertRevert(ManagementContract.new(accounts[1], accounts[1], 0, 0));
        await assertRevert(ManagementContract.new(accounts[1], accounts[1], accounts[1], 0));
    });

    const payment = 20 * 10 ** 18;
    const payee = accounts[4];
    it('should test async send', async function() {
        await tokenERC20.approve(managerContract.address, payment, {from: congress});
        const paymentBefore = await managerContract.payments.call(payee);
        await managerContract.asyncSend(payee, payment, 0, {from: congress});
        const paymentPast = await managerContract.payments.call(payee);
        const evalPayment = paymentPast - paymentBefore;
        assert.equal(evalPayment.valueOf(), payment);
    });

    it('should test withdrawPayments', async function() {
        const balanceBefore = await tokenERC20.balanceOf(payee);
        await managerContract.withdrawPayments({from: payee});
        const balancePast = await tokenERC20.balanceOf(payee);
        const evalBalance = balancePast.valueOf() - balanceBefore.valueOf();
        assert.equal(evalBalance, payment);
    });

    it('should revert withdrawPayments when payment amount is 0', async function() {
        await assertRevert(managerContract.withdrawPayments({from: payee}));
    });

    it('should revert withdrawPayments when lock time isn`t came', async function() {
        await tokenERC20.approve(managerContract.address, payment, {from: congress});
        await managerContract.asyncSend(payee, payment, 2530784179, {from: congress});
        await assertRevert(managerContract.withdrawPayments({from: payee}));
    });
});

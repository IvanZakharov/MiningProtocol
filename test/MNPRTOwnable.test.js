import shouldBehaveLikeOwnable from '../test/Ownable.behaviour';

const Ownable = artifacts.require('MNPRTToken.sol');

contract('MNPRTToken Ownable', function (accounts) {
  beforeEach(async function () {
    this.ownable = await Ownable.new(accounts[8], accounts[9]);
  });

  shouldBehaveLikeOwnable(accounts);
});

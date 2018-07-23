import shouldBehaveLikeOwnable from '../test/Ownable.behaviour';

const Ownable = artifacts.require('MiningProtToken.sol');

contract('MiningProtToken Ownable', function (accounts) {
  beforeEach(async function () {
    this.ownable = await Ownable.new();
  });

  shouldBehaveLikeOwnable(accounts);
});

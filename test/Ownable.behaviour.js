import EVMRevert from '../test/EVMRevert';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

require('chai')
  .use(require('chai-as-promised'))
  .should();

export default function (accounts) {
  describe('as an ownable', function () {
    it('should have an owner', async function () {
      let owner = await this.ownable.owner();
      owner.should.not.eq(ZERO_ADDRESS);
    });

    it('changes owner after transfer', async function () {
      let other = accounts[1];
      await this.ownable.transferOwnership(other);
      await this.ownable.claimOwnership({from: other});
      let owner = await this.ownable.owner();

      owner.should.eq(other);
    });

    it('should prevent non-owners from transfering', async function () {
      const other = accounts[2];
      const owner = await this.ownable.owner.call();
      owner.should.not.eq(other);
      await this.ownable.transferOwnership(other, { from: other }).should.be.rejectedWith(EVMRevert);
    });

    it('should guard ownership against stuck state', async function () {
      let originalOwner = accounts[7];
      await this.ownable.transferOwnership(null, { from: originalOwner }).should.be.rejectedWith(EVMRevert);
    });

    it('should set the manager', async function () {
      const manager = accounts[7];
      const owner = await this.ownable.owner.call();
      await this.ownable.setManager(manager, { from: owner });
      const realManager = await this.ownable.manager.call();
      assert.equal(manager, realManager);
    });
  });
};

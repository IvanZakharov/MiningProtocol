import assertRevert from '../test/assertRevert';
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

export default function shouldMintAndBurnERC721Token (accounts) {
  const firstTokenId = 22;
  const secondTokenId = 23;
  const unknownTokenId = 999999;
  const creator = accounts[3];
  const manager = accounts[2];
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  let counter = firstTokenId;

  describe('like a mintable and burnable ERC721Token', function () {
    beforeEach(async function () {
      let newId = await this.token.totalSupply();
      await this.token.setManager(manager, { from: creator });
      await this.token.mint(creator, newId, { from: manager });
      newId = await this.token.totalSupply();
      await this.token.mint(creator, newId, { from: manager });
    });

    describe('mint', function () {
      const to = accounts[4];
      let tokenId = 22;
      let logs = null;

      describe('when successful', function () {
        beforeEach(async function () {
          let newId = await this.token.totalSupply();
          const result = await this.token.mint(to, newId, { from: manager });
          logs = result.logs;
        });

        it('assigns the token to the new owner', async function () {
          const owner = await this.token.ownerOf(tokenId);
          owner.should.be.equal(to);
        });

        it('increases the balance of its owner', async function () {
          const balance = await this.token.balanceOf(to);
          balance.should.be.bignumber.equal(1);
        });

        it('emits a transfer event', async function () {
          logs.length.should.be.equal(1);
          logs[0].event.should.be.eq('Transfer');
          logs[0].args._from.should.be.equal(ZERO_ADDRESS);
          logs[0].args._to.should.be.equal(to);
          logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
        });
      });
    });
  });
};

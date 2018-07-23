import assertRevert from '../test/assertRevert';
import shouldBehaveLikeERC721BasicToken from '../test/ERC721BasicToken.behaviour';
import shouldMintAndBurnERC721Token from '../test/ERC721MintBurn.behaviour';
import shouldSupportInterfaces from '../test/SupportsInterface.behavior';
import _ from 'lodash';

const BigNumber = web3.BigNumber;
const MNPRTToken = artifacts.require('MNPRTTokenMock.sol');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('ERC721Token', function (accounts) {
  const holder1 = accounts[7];
  const holder2 = accounts[8];
  const firstTokenId = 20;
  const secondTokenId = 21;
  const creator = accounts[3];
  const manager = accounts[2];
  const name = "MiningProt Protocol Mining Token";
  const symbol = "MNPRT";


  beforeEach(async function () {
    this.token = await MNPRTToken.new(holder1, holder2, { from: creator });
  });

  shouldBehaveLikeERC721BasicToken(accounts);
  shouldMintAndBurnERC721Token(accounts);


  let counter = 22;

  describe('like a full ERC721', function () {
    beforeEach(async function () {
      let newId = await this.token.totalSupply();
      await this.token.setManager(manager, { from: creator });
      await this.token.mint(creator, newId, { from: manager });
      newId++;
      await this.token.mint(creator, newId, { from: manager });
    });

    describe('mint', function () {
      const to = accounts[5];
      let tokenId = 3;

      beforeEach(async function () {
          tokenId = await this.token.totalSupply();
          await this.token.mint(to, tokenId, { from: manager });
          tokenId++;
          await this.token.mint(to, tokenId, { from: manager });
      });

      it('adjusts owner tokens by index', async function () {
        const token = await this.token.tokenOfOwnerByIndex(to, 1);
        token.toNumber().should.be.equal(tokenId);
      });

      it('adjusts all tokens list', async function () {
        const newToken = await this.token.tokenByIndex(22);
        newToken.toNumber().should.be.equal(tokenId.valueOf()-1);
      });
    });

    describe('metadata', function () {
      const sampleUri = 'mock://mytoken';

      it('has a name', async function () {
        const tokenName = await this.token.name();
        tokenName.should.be.equal(name);
      });

      it('has a symbol', async function () {
        const tokenSymbol = await this.token.symbol();
        tokenSymbol.should.be.equal(symbol);
      });

      it('sets and returns metadata for a token id', async function () {
        await this.token.setTokenURI(firstTokenId, sampleUri);
        const uri = await this.token.tokenURI(firstTokenId);
        uri.should.be.equal(sampleUri);
      });

      it('returns empty metadata for token', async function () {
        const uri = await this.token.tokenURI(firstTokenId);
        uri.should.be.equal('');
      });

      it('reverts when querying metadata for non existant token id', async function () {
        await assertRevert(this.token.tokenURI(500));
      });
    });

    describe('totalSupply', function () {
      it('returns total token supply', async function () {
        const totalSupply = await this.token.totalSupply();
        totalSupply.should.be.bignumber.equal(22);
      });
    });

    describe('tokenOfOwnerByIndex', function () {
      const owner = creator;
      const another = accounts[1];

      describe('when the given index is lower than the amount of tokens owned by the given address', function () {
        it('returns the token ID placed at the given index', async function () {
          const tokenId = await this.token.tokenOfOwnerByIndex(owner, 0);
          tokenId.should.be.bignumber.equal(firstTokenId);
        });
      });

      describe('when the index is greater than or equal to the total tokens owned by the given address', function () {
        it('reverts', async function () {
          await assertRevert(this.token.tokenOfOwnerByIndex(owner, 2));
        });
      });

      describe('when the given address does not own any token', function () {
        it('reverts', async function () {
          await assertRevert(this.token.tokenOfOwnerByIndex(another, 0));
        });
      });

      describe('after transferring all tokens to another user', function () {
        beforeEach(async function () {
          await this.token.transferFrom(owner, another, firstTokenId, { from: owner });
          await this.token.transferFrom(owner, another, secondTokenId, { from: owner });
        });

        it('returns correct token IDs for target', async function () {
          const count = await this.token.balanceOf(another);
          count.toNumber().should.be.equal(2);
          const tokensListed = await Promise.all(_.range(2).map(i => this.token.tokenOfOwnerByIndex(another, i)));
          tokensListed.map(t => t.toNumber()).should.have.members([firstTokenId, secondTokenId]);
        });

        it('returns empty collection for original owner', async function () {
          const count = await this.token.balanceOf(owner);
          count.toNumber().should.be.equal(0);
          await assertRevert(this.token.tokenOfOwnerByIndex(owner, 0));
        });
      });
    });

    describe('tokenByIndex', function () {
      it('should return all tokens', async function () {
        const tokensListed = await Promise.all(_.range(2).map(i => this.token.tokenByIndex(i)));
        tokensListed.map(t => t.toNumber()).should.have.members([0, 1]);
      });

      it('should revert if index is greater than supply', async function () {
        let index = await this.token.totalSupply()+1;
        await assertRevert(this.token.tokenByIndex(index));
      });
    });
  });

  shouldSupportInterfaces([
    'ERC165',
    'ERC721',
    'ERC721Exists',
    'ERC721Enumerable',
    'ERC721Metadata',
  ]);
});

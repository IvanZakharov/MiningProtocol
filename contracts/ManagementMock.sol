pragma solidity 0.4.24;

import "./Management.sol";


contract ManagementMock is Management {

  constructor(
      address _token,
      address _miningToken,
      address _dao,
      address _fund
  )
      public
      Management(_token, _miningToken, _dao, _fund) { }

    /**
     * @dev temporary function
     */
    function __getTimeReward(uint256 _time) external view returns(uint256) {
        return miningReward[_time];
    }

    /**
     * @dev temporary function
     */
    function __multiMint(address _to, uint256 _amount) external onlyOwner {
        uint256 _currentTime = now;
        for (uint256 i = 0; i < _amount; i++) {
            uint256 _id = miningToken.totalSupply();
            miningToken.mint(_to, _id);
            lastGettingReward[_id] = _currentTime - (_currentTime % (1 days)) + 1 days;
        }
    }

    /**
     * @param _tokenIds token ids
     * @return timestamp of token creation
     */
    function __updateTokensTime
    (
        uint256[] _tokenIds,
        uint256 _num
    )
        external
        onlyOwner
    {
        for (uint256 i = 0; i < _tokenIds.length; i++)
            lastGettingReward[_tokenIds[i]] = _num;
    }

    /**
     * @dev temporary function
     */
    function __setStartTime(uint256 _time) external onlyOwner {
        startTime = _time;
    }
}

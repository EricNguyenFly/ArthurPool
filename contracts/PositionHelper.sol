// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "./interfaces/IArthurRouter.sol";
import "./interfaces/INFTPool.sol";

contract PositionHelper is ReentrancyGuard {
  using Address for address;
  using SafeERC20 for IERC20;
  using SafeMath for uint256;

  bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;
  IArthurRouter public immutable router;
  address public immutable weth;

  uint256 expectedTokenId;
  address expectedNftPool;

  constructor(IArthurRouter router_, address weth_){
    router = router_;
    weth = weth_;
  }

  receive() external payable {
    assert(msg.sender == weth); // only accept ETH via fallback from the WETH contract
  }

  function onERC721Received(address /*operator*/, address from, uint256 tokenId, bytes calldata /*data*/) external view returns (bytes4){
    require(tokenId == expectedTokenId && msg.sender == expectedNftPool && from == address(0), "Invalid tokenId");
    return _ERC721_RECEIVED;
  }

  function addLiquidityAndCreatePosition(
    address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired,
    uint256 amountAMin, uint256 amountBMin, uint256 deadline, address to, INFTPool nftPool, uint256 lockDuration, uint256 timeLock
  ) external nonReentrant {
    address lp = router.getPair(tokenA, tokenB);

    {
      (address nftUnderlyingAsset,,,,,,,) = nftPool.getPoolInfo();
      require(lp == nftUnderlyingAsset, "invalid nftPool");
    }

    bytes memory data = address(router).functionDelegateCall(
      abi.encodeWithSelector(
        router.addLiquidity.selector,
        tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, address(this), deadline, timeLock
      )
    );
    (,, uint256 lpAmount) = abi.decode(data, (uint256, uint256, uint256));

    expectedTokenId = nftPool.lastTokenId().add(1);
    expectedNftPool = address(nftPool);

    IERC20(lp).safeApprove(expectedNftPool, lpAmount);
    nftPool.createPosition(lpAmount, lockDuration);

    (uint256 lpAmount_,,,uint256 lockDuration_,,,,) = nftPool.getStakingPosition(expectedTokenId);
    require(lpAmount == lpAmount_ && lockDuration == lockDuration_, "invalid position created");
    nftPool.safeTransferFrom(address(this), to, expectedTokenId);

    expectedTokenId = 0;
    expectedNftPool = address(0);
  }


  function addLiquidityETHAndCreatePosition(
    address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, uint256 deadline, uint256 timeLock,
    address to, INFTPool nftPool, uint256 lockDuration
  ) external payable nonReentrant {
    address lp = router.getPair(token, weth);

    (address nftUnderlyingAsset,,,,,,,) = nftPool.getPoolInfo();
    require(lp == nftUnderlyingAsset, "invalid nftPool");

    bytes memory data = address(router).functionDelegateCall(
      abi.encodeWithSelector(
        router.addLiquidityETH.selector,
        token, amountTokenDesired, amountTokenMin, amountETHMin, address(this), deadline, timeLock
      )
    );
    (,, uint256 lpAmount) = abi.decode(data, (uint256, uint256, uint256));

    expectedTokenId = nftPool.lastTokenId().add(1);
    expectedNftPool = address(nftPool);

    IERC20(lp).safeApprove(expectedNftPool, lpAmount);
    nftPool.createPosition(lpAmount, lockDuration);

    (uint256 lpAmount_,,,uint256 lockDuration_,,,,) = nftPool.getStakingPosition(expectedTokenId);
    require(lpAmount == lpAmount_ && lockDuration == lockDuration_, "invalid position created");
    nftPool.safeTransferFrom(address(this), to, expectedTokenId);

    expectedTokenId = 0;
    expectedNftPool = address(0);
  }
}
// src/DynamicMemeFactory.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./DynamicMeme.sol";
import "./BondingCurve.sol";

contract DynamicMemeFactory {
    address public immutable implementation;
    address public immutable bondingCurve;
    address public immutable protocolFeeRecipient;
    address public immutable protocolRewards;
    address public immutable weth;
    address public immutable positionManager;
    address public immutable swapRouter;

    event MemeTokenDeployed(
        address indexed token,
        address indexed creator,
        string memeType
    );

    constructor(
        address _protocolFeeRecipient,
        address _protocolRewards,
        address _weth,
        address _positionManager,
        address _swapRouter
    ) {
        protocolFeeRecipient = _protocolFeeRecipient;
        protocolRewards = _protocolRewards;
        weth = _weth;
        positionManager = _positionManager;
        swapRouter = _swapRouter;

        implementation = address(new DynamicMeme(
            _protocolFeeRecipient,
            _protocolRewards,
            _weth,
            _positionManager,
            _swapRouter
        ));

        bondingCurve = address(new BondingCurve());
    }

    function deployMeme(
        string memory symbol,
        string memory tokenURI,
        string memory memeType,
        address platformReferrer,
        DynamicMeme.MemeLevel[] memory initialLevels
    ) external returns (address) {
        bytes memory initData = abi.encodeWithSelector(
            DynamicMeme.initialize.selector,
            msg.sender, // tokenCreator
            platformReferrer,
            bondingCurve,
            tokenURI,
            symbol,
            memeType,
            initialLevels
        );

        ERC1967Proxy proxy = new ERC1967Proxy(
            implementation,
            initData
        );

        emit MemeTokenDeployed(address(proxy), msg.sender, memeType);
        return address(proxy);
    }
}
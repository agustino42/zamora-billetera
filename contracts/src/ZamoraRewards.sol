// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

interface IZamora {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function burnFrom(address from, uint256 amount, string calldata reason) external;
}

/**
 * @title ZamoraRewards
 * @notice Catálogo de recompensas y canje. Al canjear se QUEMA ZAMORA (sink).
 */
contract ZamoraRewards is AccessControl {
    IZamora public token;

    struct Reward {
        uint256 id;
        string name;
        string description;
        uint256 cost;
        uint256 stock; // 0 = ilimitado
        uint256 redeemed;
        bool active;
    }

    uint256 public rewardCount;
    mapping(uint256 => Reward) public rewards;

    event RewardCreated(uint256 indexed rewardId, string name, uint256 cost);
    event RewardUpdated(uint256 indexed rewardId, bool active);
    event Redeemed(address indexed student, uint256 indexed rewardId, uint256 cost);

    constructor(address admin, address tokenAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        token = IZamora(tokenAddress);
    }

    function setToken(address tokenAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        token = IZamora(tokenAddress);
    }

    function createReward(
        string calldata name,
        string calldata description,
        uint256 cost,
        uint256 stock
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        rewardCount += 1;
        rewards[rewardCount] = Reward({
            id: rewardCount,
            name: name,
            description: description,
            cost: cost,
            stock: stock,
            redeemed: 0,
            active: true
        });
        emit RewardCreated(rewardCount, name, cost);
        return rewardCount;
    }

    function setRewardActive(uint256 rewardId, bool active) external onlyRole(DEFAULT_ADMIN_ROLE) {
        rewards[rewardId].active = active;
        emit RewardUpdated(rewardId, active);
    }

    /// @notice Canjea una recompensa para `student`. El estudiante concede la
    ///         allowance por firma `permit` (sin gas) y el relayer envía la tx.
    ///         Al canjear se QUEMA ZAMORA del estudiante (sink deflacionario).
    function redeem(uint256 rewardId, address student) external {
        Reward storage r = rewards[rewardId];
        require(r.active, "Zamora: recompensa inactiva");
        if (r.stock > 0) {
            require(r.redeemed < r.stock, "Zamora: agotado");
        }
        r.redeemed += 1;
        // Requiere allowance del estudiante hacia este contrato (vía permit).
        token.burnFrom(student, r.cost, "reward-redeem");
        emit Redeemed(student, rewardId, r.cost);
    }
}

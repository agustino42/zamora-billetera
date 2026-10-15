// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

interface IZamoraF {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function burn(uint256 amount, string calldata reason) external;
}

/**
 * @title ZamoraForum
 * @notice Foro on-chain: ancla el hash de cada post (autoría verificable).
 *         Peaje anti-spam en ZAMORA: se DEVUELVE si el post recibe upvotes
 *         suficientes y se QUEMA si es retirado por moderación.
 */
contract ZamoraForum is AccessControl {
    IZamoraF public token;

    uint256 public toll = 5; // ZAMORA para publicar
    uint256 public refundThreshold = 5; // upvotes para devolver el peaje

    struct Post {
        uint256 id;
        address author;
        bytes32 contentHash;
        uint256 createdAt;
        uint256 upvotes;
        uint256 downvotes;
        uint256 tollDeposited;
        bool refunded;
        bool removed;
    }

    uint256 public postCount;
    mapping(uint256 => Post) public posts;
    mapping(uint256 => mapping(address => uint8)) public votes; // 0 none, 1 up, 2 down
    mapping(uint256 => mapping(address => bool)) public reported;

    event PostCreated(uint256 indexed postId, address indexed author, bytes32 contentHash);
    event Voted(uint256 indexed postId, address indexed voter, bool up);
    event TollRefunded(uint256 indexed postId, address indexed author, uint256 amount);
    event PostRemoved(uint256 indexed postId, uint256 burned);
    event TollUpdated(uint256 toll, uint256 refundThreshold);

    constructor(address admin, address tokenAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        token = IZamoraF(tokenAddress);
    }

    function setToken(address tokenAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        token = IZamoraF(tokenAddress);
    }

    function setToll(uint256 newToll, uint256 newThreshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        toll = newToll;
        refundThreshold = newThreshold;
        emit TollUpdated(newToll, newThreshold);
    }

    function createPost(bytes32 contentHash) external returns (uint256) {
        if (toll > 0) {
            require(
                token.transferFrom(msg.sender, address(this), toll),
                "Zamora: peaje rechazado"
            );
        }
        postCount += 1;
        posts[postCount] = Post({
            id: postCount,
            author: msg.sender,
            contentHash: contentHash,
            createdAt: block.timestamp,
            upvotes: 0,
            downvotes: 0,
            tollDeposited: toll,
            refunded: false,
            removed: false
        });
        emit PostCreated(postCount, msg.sender, contentHash);
        return postCount;
    }

    function upvote(uint256 postId) external {
        Post storage p = posts[postId];
        require(!p.removed, "Zamora: post retirado");
        require(votes[postId][msg.sender] == 0, "Zamora: ya votaste");
        votes[postId][msg.sender] = 1;
        p.upvotes += 1;
        emit Voted(postId, msg.sender, true);
        if (!p.refunded && p.tollDeposited > 0 && p.upvotes >= refundThreshold) {
            p.refunded = true;
            token.transfer(p.author, p.tollDeposited);
            emit TollRefunded(postId, p.author, p.tollDeposited);
        }
    }

    function downvote(uint256 postId) external {
        Post storage p = posts[postId];
        require(!p.removed, "Zamora: post retirado");
        require(votes[postId][msg.sender] == 0, "Zamora: ya votaste");
        votes[postId][msg.sender] = 2;
        p.downvotes += 1;
        emit Voted(postId, msg.sender, false);
    }

    function report(uint256 postId) external {
        reported[postId][msg.sender] = true;
    }

    /// @notice Moderación: retira el post y quema el peaje retenido.
    function removePost(uint256 postId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Post storage p = posts[postId];
        require(!p.removed, "Zamora: ya retirado");
        uint256 burnAmount = p.refunded ? 0 : p.tollDeposited;
        p.removed = true;
        if (burnAmount > 0) {
            token.burn(burnAmount, "forum-removed");
        }
        emit PostRemoved(postId, burnAmount);
    }
}

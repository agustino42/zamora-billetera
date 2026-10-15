// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ZamoraCollectibles
 * @notice NFTs del campus:
 *         - Pass:        pase de conferencia (transferible)
 *         - Badge:       logro/insignia (SBT, no transferible)
 *         - Certificate: certificado de curso (SBT, no transferible)
 */
contract ZamoraCollectibles is ERC721, AccessControl {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    enum Kind {
        Pass,
        Badge,
        Certificate
    }

    struct Item {
        Kind kind;
        uint256 refId; // id de conferencia/curso/logro
        string uri;
        bool soulbound;
    }

    uint256 public nextTokenId = 1;
    mapping(uint256 => Item) public items;
    string public baseUri;

    event Minted(address indexed to, uint256 indexed tokenId, Kind kind, uint256 refId);

    constructor(
        address admin,
        string memory name_,
        string memory symbol_
    ) ERC721(name_, symbol_) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    function setBaseUri(string calldata uri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        baseUri = uri;
    }

    function _mintItem(
        address to,
        Kind kind,
        uint256 refId,
        string calldata uri_,
        bool soulbound
    ) internal returns (uint256) {
        uint256 tokenId = nextTokenId++;
        items[tokenId] = Item({kind: kind, refId: refId, uri: uri_, soulbound: soulbound});
        _safeMint(to, tokenId);
        emit Minted(to, tokenId, kind, refId);
        return tokenId;
    }

    function mintPass(
        address to,
        uint256 conferenceId,
        string calldata uri_
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        return _mintItem(to, Kind.Pass, conferenceId, uri_, false);
    }

    function mintBadge(
        address to,
        uint256 badgeId,
        string calldata uri_
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        return _mintItem(to, Kind.Badge, badgeId, uri_, true);
    }

    function mintCertificate(
        address to,
        uint256 courseId,
        string calldata uri_
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        return _mintItem(to, Kind.Certificate, courseId, uri_, true);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        string memory itemUri = items[tokenId].uri;
        if (bytes(itemUri).length > 0) return itemUri;
        if (bytes(baseUri).length == 0) return "";
        return string.concat(baseUri, tokenId.toString());
    }

    function isSoulbound(uint256 tokenId) external view returns (bool) {
        return items[tokenId].soulbound;
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // Bloquea transferencias de tokens soulbound (solo permite mint/quema).
        if (from != address(0) && to != address(0) && items[tokenId].soulbound) {
            revert("Zamora: SBT no transferible");
        }
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

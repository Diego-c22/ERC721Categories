// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

contract ERC721Categories is ERC721Upgradeable, OwnableUpgradeable {
    mapping(uint256 => uint256) private _limits;
    mapping(uint256 => string) public _categories;
    mapping(uint256 => uint256) public _pricesPreSale;
    mapping(uint256 => uint256) public _pricesPublicSale;
    mapping(uint256 => uint256) private _currentIndexes;

    // 0 => PreSale
    // 1 => PublicSale
    uint256 public _activeSale;

    bool public _reveled;
    string private _baseUri;
    string private _hiddenBaseUri;
    uint256 public _categoriesQuantity;

    function initialize(
        string[] memory categories,
        uint256[][] memory limits,
        uint256[] memory pricesPreSale,
        uint256[] memory pricesPublicSale,
        string memory uri
    ) public initializer {
        __Context_init_unchained();
        __ERC165_init_unchained();
        __ERC721_init_unchained("MyCollectible", "MCO");
        __Ownable_init_unchained();

        _baseUri = uri;
        _hiddenBaseUri = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQY1F6WhC05fiK71bC0953K-HplZLuAWQOfg&usqp=CAU";

        for (uint256 i; i < categories.length; ) {
            _categories[i] = categories[i];
            _pricesPreSale[i] = pricesPreSale[i];
            _pricesPublicSale[i] = pricesPublicSale[i];
            uint256 value = encodeNumbers(limits[i][0], limits[i][1]);
            _currentIndexes[i] = limits[i][0];
            _limits[i] = value;
            unchecked {
                ++i;
            }
        }
    }

    function _baseURI() internal view override returns (string memory) {
        return _reveled ? _baseUri : _hiddenBaseUri;
    }

    function setBaseURI(string memory uri) external onlyOwner {
        _baseUri = uri;
    }

    function setReveled(bool status) external onlyOwner {
        _reveled = status;
    }

    function setHiddenBaseURI(string memory uri) external onlyOwner {
        _hiddenBaseUri = uri;
    }

    function setActiveSale(uint256 value) external onlyOwner {
        require(
            value == 0 || value == 1,
            "Acceptable values are 1: PreSale 2: publicSale"
        );
        _activeSale = value;
    }

    function setPreSalePrice(uint256 category, uint256 price)
        external
        onlyOwner
    {
        require(price >= 0, "Price must be greater than 0");
        _pricesPreSale[category] = price;
    }

    function setPublicSalePrice(uint256 category, uint256 price)
        external
        onlyOwner
    {
        require(price >= 0, "Price must be greater than 0");
        _pricesPublicSale[category] = price;
    }

    function setCategoryName(uint256 category, string memory _name)
        external
        onlyOwner
    {
        _categories[category] = _name;
    }

    function encodeNumbers(uint256 a, uint256 b)
        internal
        pure
        returns (uint256 encoded)
    {
        encoded |= uint256(uint128(a)) << 128;
        encoded |= uint256(uint128(b));
    }

    function decodeNumber(uint256 encode)
        internal
        pure
        returns (uint256 a, uint256 b)
    {
        a = uint256(encode) >> 128;
        b = uint256(uint128(encode));
    }

    function mint(uint256 category) external payable {
        uint256 currentIndex = _currentIndexes[category];
        (, uint256 end) = decodeNumber(_limits[category]);

        require(end >= currentIndex, "ERC721: Category sold out");
        if (_activeSale == 0)
            require(
                msg.value == _pricesPreSale[category],
                "ERC721: Price not covered"
            );
        else
            require(
                msg.value == _pricesPublicSale[category],
                "ERC721: Price not covered"
            );

        _mint(msg.sender, currentIndex);
        _currentIndexes[category] = currentIndex + 1;
    }

    function getProfits() external onlyOwner {
        (bool sent, ) = payable(msg.sender).call{value: address(this).balance}(
            ""
        );
        require(sent, "Failed to send Ether");
    }

    function getTokensOfAddress(address address_, uint256 category_)
        external
        view
        returns (string[] memory)
    {
        (uint256 start, uint256 end) = decodeNumber(_limits[category_]);

        string[] memory tokensOwned = new string[](balanceOf(address_));
        uint256 counter;
        for (start; start <= end; ) {
            if (_ownerOf(start) == address_) {
                tokensOwned[counter] = tokenURI(start);
                unchecked {
                    ++counter;
                }
            }
            unchecked {
                ++start;
            }
        }

        return tokensOwned;
    }
}

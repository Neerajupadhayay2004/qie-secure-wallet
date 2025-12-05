// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title DeFi Without Borders - Core DeFi Hub
/// @notice Multi-token payments + escrow + fraud signalling for off-chain AI
/// @dev Assume QIE blockchain is EVM-compatible

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount)
        external
        returns (bool);
    function allowance(address owner, address spender)
        external
        view
        returns (uint256);
    function approve(address spender, uint256 amount)
        external
        returns (bool);
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
}

contract DeFiWithoutBorders {
    // ---------------------------------------------------------------------
    //  Admin / Roles
    // ---------------------------------------------------------------------
    address public owner;
    address public fraudOracle; // off-chain AI backend wallet (can be your QIE address)

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyFraudOracle() {
        require(msg.sender == fraudOracle, "Not fraud oracle");
        _;
    }

    constructor(address _owner, address _fraudOracle) {
        require(_owner != address(0), "Invalid owner");
        require(_fraudOracle != address(0), "Invalid oracle");
        owner = _owner;
        fraudOracle = _fraudOracle;
    }

    function updateFraudOracle(address _newOracle) external onlyOwner {
        require(_newOracle != address(0), "Invalid oracle");
        fraudOracle = _newOracle;
    }

    // ---------------------------------------------------------------------
    //  Supported Tokens (USDT, USDC, DAI, QIE, etc.)
    // ---------------------------------------------------------------------
    mapping(address => bool) public supportedTokens; // ERC20 token => isSupported
    address[] public supportedTokenList;

    event TokenSupportUpdated(address token, bool isSupported);

    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token");
        require(!supportedTokens[token], "Already supported");
        supportedTokens[token] = true;
        supportedTokenList.push(token);
        emit TokenSupportUpdated(token, true);
    }

    function removeSupportedToken(address token) external onlyOwner {
        require(supportedTokens[token], "Not supported");
        supportedTokens[token] = false;
        emit TokenSupportUpdated(token, false);
        // list se remove nahi kar rahe, frontend filter kar sakta hai
    }

    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokenList;
    }

    // ---------------------------------------------------------------------
    //  User Profile / Local Currency (for dashboard display)
    // ---------------------------------------------------------------------
    struct UserProfile {
        string countryCode;  // e.g., "IN"
        string fiatCurrency; // e.g., "INR", "USD"
        bool exists;
    }

    mapping(address => UserProfile) public profiles;

    event UserRegistered(
        address indexed user,
        string countryCode,
        string fiatCurrency
    );

    function registerUser(
        string calldata countryCode,
        string calldata fiatCurrency
    ) external {
        profiles[msg.sender] = UserProfile({
            countryCode: countryCode,
            fiatCurrency: fiatCurrency,
            exists: true
        });
        emit UserRegistered(msg.sender, countryCode, fiatCurrency);
    }

    // ---------------------------------------------------------------------
    //  Blacklist / Whitelist
    // ---------------------------------------------------------------------
    mapping(address => bool) public blacklisted;
    mapping(address => bool) public whitelisted;

    event AddressBlacklisted(address indexed user, bool blacklisted);
    event AddressWhitelisted(address indexed user, bool whitelisted);

    function setBlacklisted(address user, bool value) external onlyOwner {
        blacklisted[user] = value;
        emit AddressBlacklisted(user, value);
    }

    function setWhitelisted(address user, bool value) external onlyOwner {
        whitelisted[user] = value;
        emit AddressWhitelisted(user, value);
    }

    modifier notBlacklisted(address user) {
        require(!blacklisted[user], "Address blacklisted");
        _;
    }

    // ---------------------------------------------------------------------
    //  AI Fraud Detection Hooks (Events for Off-chain AI)
    // ---------------------------------------------------------------------

    /// @dev Frontend/Backend can log extra metadata as a hash (e.g., IP + device fingerprint)
    struct FraudMeta {
        bool isFlagged;
        uint8 riskScore; // 0-100
        string reason;
    }

    mapping(bytes32 => FraudMeta) public fraudReports; // txId => fraud info

    event FraudCheckRequested(
        bytes32 indexed txId,
        address indexed from,
        address indexed to,
        address token,
        uint256 amount,
        uint256 timestamp,
        string metadataHash
    );

    event FraudReportUpdated(
        bytes32 indexed txId,
        uint8 riskScore,
        bool isFlagged,
        string reason
    );

    /// @notice Called by frontend/backend BEFORE executing a payment
    /// @param txId Unique ID generated off-chain (keccak of data)
    /// @param metadataHash Off-chain metadata fingerprint (e.g., IP, device)
    function requestFraudCheck(
        bytes32 txId,
        address to,
        address token,
        uint256 amount,
        string calldata metadataHash
    ) external notBlacklisted(msg.sender) {
        emit FraudCheckRequested(
            txId,
            msg.sender,
            to,
            token,
            amount,
            block.timestamp,
            metadataHash
        );
        // Off-chain AI will listen to this event, compute risk and then
        // call updateFraudReport with txId.
    }

    /// @notice Called by fraudOracle after ML model evaluation
    function updateFraudReport(
        bytes32 txId,
        uint8 riskScore,
        bool isFlagged,
        string calldata reason
    ) external onlyFraudOracle {
        require(riskScore <= 100, "Invalid score");
        fraudReports[txId] = FraudMeta({
            isFlagged: isFlagged,
            riskScore: riskScore,
            reason: reason
        });
        emit FraudReportUpdated(txId, riskScore, isFlagged, reason);
    }

    // ---------------------------------------------------------------------
    //  Instant Payments
    // ---------------------------------------------------------------------

    event PaymentSent(
        bytes32 indexed txId,
        address indexed from,
        address indexed to,
        address token,
        uint256 amount,
        uint256 timestamp
    );

    /// @notice Main payment function - uses ERC20.transferFrom
    /// @dev User must approve this contract for `amount` tokens beforehand
    function sendPayment(
        bytes32 txId,
        address to,
        address token,
        uint256 amount
    ) external notBlacklisted(msg.sender) notBlacklisted(to) {
        require(supportedTokens[token], "Token not supported");
        require(to != address(0), "Invalid receiver");
        require(amount > 0, "Amount must be > 0");

        FraudMeta memory meta = fraudReports[txId];
        // Example policy: block payments if riskScore > 80 and flagged
        require(
            !meta.isFlagged || meta.riskScore <= 80,
            "Tx blocked: high fraud risk"
        );

        // Transfer tokens from sender to receiver
        bool ok = IERC20(token).transferFrom(msg.sender, to, amount);
        require(ok, "Token transfer failed");

        emit PaymentSent(txId, msg.sender, to, token, amount, block.timestamp);
    }

    // ---------------------------------------------------------------------
    //  Escrow Logic (Client ↔ Freelancer)
    // ---------------------------------------------------------------------

    enum EscrowStatus {
        None,
        Funded,
        InDispute,
        Completed,
        Refunded
    }

    struct Escrow {
        address payer;
        address payee;
        address token;
        uint256 amount;
        EscrowStatus status;
        uint256 createdAt;
        bytes32 metadataId; // off-chain: can link to chat room / milestone
    }

    uint256 public nextEscrowId;
    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed payer,
        address indexed payee,
        address token,
        uint256 amount,
        bytes32 metadataId
    );

    event EscrowCompleted(
        uint256 indexed escrowId,
        address indexed payer,
        address indexed payee
    );

    event EscrowRefunded(
        uint256 indexed escrowId,
        address indexed payer,
        address indexed payee
    );

    event EscrowDisputed(
        uint256 indexed escrowId,
        address indexed initiator
    );

    /// @notice Create and fund an escrow
    /// @dev Payer must approve tokens to this contract before calling
    function createEscrow(
        address payee,
        address token,
        uint256 amount,
        bytes32 metadataId
    ) external notBlacklisted(msg.sender) notBlacklisted(payee) returns (uint256) {
        require(supportedTokens[token], "Token not supported");
        require(payee != address(0), "Invalid payee");
        require(amount > 0, "Amount must be > 0");

        // Move tokens from payer to contract
        bool ok = IERC20(token).transferFrom(msg.sender, address(this), amount);
        require(ok, "Token transfer failed");

        uint256 escrowId = ++nextEscrowId;

        escrows[escrowId] = Escrow({
            payer: msg.sender,
            payee: payee,
            token: token,
            amount: amount,
            status: EscrowStatus.Funded,
            createdAt: block.timestamp,
            metadataId: metadataId
        });

        emit EscrowCreated(
            escrowId,
            msg.sender,
            payee,
            token,
            amount,
            metadataId
        );

        return escrowId;
    }

    /// @notice Payer releases funds to payee after work is accepted
    function releaseEscrow(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Funded, "Not funded");
        require(msg.sender == e.payer, "Not payer");

        e.status = EscrowStatus.Completed;

        bool ok = IERC20(e.token).transfer(e.payee, e.amount);
        require(ok, "Token transfer failed");

        emit EscrowCompleted(escrowId, e.payer, e.payee);
    }

    /// @notice Payer or payee can mark dispute - admin/off-chain AI can then decide
    function raiseDispute(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Funded, "Not disputable");
        require(msg.sender == e.payer || msg.sender == e.payee, "Not party");
        e.status = EscrowStatus.InDispute;

        emit EscrowDisputed(escrowId, msg.sender);
    }

    /// @notice Owner (or a dedicated dispute resolver) refunds payer
    function resolveDisputeRefund(uint256 escrowId) external onlyOwner {
        Escrow storage e = escrows[escrowId];
        require(
            e.status == EscrowStatus.InDispute ||
            e.status == EscrowStatus.Funded,
            "Invalid status"
        );

        e.status = EscrowStatus.Refunded;

        bool ok = IERC20(e.token).transfer(e.payer, e.amount);
        require(ok, "Token transfer failed");

        emit EscrowRefunded(escrowId, e.payer, e.payee);
    }

    /// @notice Owner can force-complete escrow in favour of payee
    function resolveDisputeRelease(uint256 escrowId) external onlyOwner {
        Escrow storage e = escrows[escrowId];
        require(
            e.status == EscrowStatus.InDispute ||
            e.status == EscrowStatus.Funded,
            "Invalid status"
        );

        e.status = EscrowStatus.Completed;

        bool ok = IERC20(e.token).transfer(e.payee, e.amount);
        require(ok, "Token transfer failed");

        emit EscrowCompleted(escrowId, e.payer, e.payee);
    }
}

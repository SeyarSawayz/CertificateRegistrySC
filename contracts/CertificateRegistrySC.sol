// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;
pragma experimental ABIEncoderV2;

contract CertificateRegistrySC {
    struct Access {
        address user;
        bool access;
    }

    struct Record {
        string url;
        string fileHash;
    }
    mapping(address => string[]) value; 
    mapping(bytes32 => Record) private records; 
    mapping(address => mapping(bytes32 => bool)) ownership;
    mapping(address => mapping(address=> bool)) ownerships; 
    mapping(address => Access[]) accessList;
    mapping(address => mapping(address => bool)) previousData;

    constructor() {}

   function add(address studentAddress, string memory studentName, string memory rollNumber, uint16 passingYear, string memory url, string memory fileHash) external {
    bytes32 nameHash = keccak256(abi.encodePacked(studentName, rollNumber, passingYear));
    Record storage record = records[nameHash];
    record.url = url;
    record.fileHash = fileHash;

    // Set ownership for the student
    ownership[studentAddress][nameHash] = true;

    // Update the value mapping with the user's URL and file hash
    value[studentAddress].push(url);
    value[studentAddress].push(fileHash);
}

    function getDocumentByStudent(string memory studentName, string memory rollNumber, uint16 passingYear) public view returns (string memory url, string memory fileHash) {
        bytes32 nameHash = keccak256(abi.encodePacked(studentName, rollNumber, passingYear));
        Record memory record = records[nameHash];
        return (record.url, record.fileHash);
    }

function allow(address user) external {
    // Set access to true for the specified user
    ownerships[msg.sender][user] = true;

    if (previousData[msg.sender][user]) {
        for (uint i = 0; i < accessList[msg.sender].length; i++) {
            if (accessList[msg.sender][i].user == user) {
                accessList[msg.sender][i].access = true;
            }
        }
    } else {
        accessList[msg.sender].push(Access(user, true));
        previousData[msg.sender][user] = true;
    }
}

    function disAllow(address user) external {
    // Set access to false for the specified user
    ownerships[msg.sender][user] = false;

    for (uint i = 0; i < accessList[msg.sender].length; i++) {
        if (accessList[msg.sender][i].user == user) {
            accessList[msg.sender][i].access = false;
        }
    }
}


function display(address _user) external view returns (string[] memory) {
    require(_user == msg.sender || ownerships[_user][msg.sender], "You don't have access");
    return value[_user];
}

    function sharedAccess() public view returns (address[] memory) {
    Access[] memory accessArray = accessList[msg.sender];
    address[] memory sharedUsers = new address[](accessArray.length);

    for (uint i = 0; i < accessArray.length; i++) {
        sharedUsers[i] = accessArray[i].user;
    }

    return sharedUsers;
}

}

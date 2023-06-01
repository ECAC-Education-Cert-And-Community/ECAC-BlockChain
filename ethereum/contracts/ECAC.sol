pragma solidity ^0.6.0;

contract UserContract {
    struct User {
        uint reflectedLikes;
        uint reflectedNestedComments;
        uint point;
        bool initialized;
    }
    
    mapping(address => User) public users;
    
    // 초기화 함수
    // 여기서 id 는 사용자가 가입했을 때의 DB에 나오는 기본 번호로 가정
    function initializeUser() private {
        User memory user = User({
            reflectedLikes: 0,
            reflectedNestedComments: 0,
            point: 0,
            initialized: true
        });
    
        users[msg.sender] = user;
    }

    function addUser(address _userAddress) public {
        if (!users[_userAddress].initialized) {
            initializeUser();
        }
    }

    // Point 조회
    function getCount(address _userAddress) public view returns (uint) {
        return users[_userAddress].point;
    }


    // 좋아요에 따른 Point 지급 - 100개 당 100p
    function addPoint_likes(address _userAddress, uint likes) public {
        uint likesHundred = likes / 100;
        if (likesHundred > users[_userAddress].reflectedLikes) {
            users[_userAddress].point += ((likesHundred-users[_userAddress].reflectedLikes)*100);
            users[_userAddress].reflectedLikes += (likesHundred-users[_userAddress].reflectedLikes);
        }
    }

    // 대댓글에 따른 Point 지급 - 20개 당 100p
    function addPoint_nestedComments(address _userAddress, uint nestedComments) public {
        uint nestedCommentsTwenty = nestedComments / 20;
        if (nestedCommentsTwenty > users[_userAddress].reflectedNestedComments) {
            users[_userAddress].point +=  ((nestedCommentsTwenty-users[_userAddress].reflectedNestedComments)*100);
            users[_userAddress].reflectedNestedComments += (nestedCommentsTwenty-users[_userAddress].reflectedNestedComments);
        }
    }

    // 사용자 입력에 따른 포인트 지급
    function refunds(address _userAddress, uint input) public {
        users[_userAddress].point -= input;
    }

}
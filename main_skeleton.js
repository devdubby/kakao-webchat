// 현재 로그인 상태를 체크해준다.
firebase.auth().onAuthStateChanged(function(user) {
  showLoading();
  if (user) {
    loadData();
  } else {
    hideLoading();
  }
});

// 로그인 화면에서 키보드 입력을 컨트롤 한다.
$(".kakao-login").keyup(function(event) {
  if (event.keyCode === 13) {
    // Enter 입력 시 실행
    $("#login-btn").click();
  } else {
    hideErrorLog();

    if (getPassword().length > 5) {
      enableLogin();
    } else {
      disableLogin();
    }
  }
});

// 회원가입을 진행한다.
function signup() {
  showLoading();
  // 회원가입할 이메일과 비밀번호를 통해 회원가입을 진행한다.

  var email = getEmail();
  var pwd = getPassword();

  firebase
    .auth()
    .createUserWithEmailAndPassword(email, pwd)
    .then(
      function(user) {
        // 기존 회원가입이 없는 최초 회원가입일 경우 진행된다.
        // 기존 회원가입이 있는 경우 아래 error -> auth/email-already-in-use로 이동한다.
        // 회원가입이 완료 되었으면 회원 정보를 DB에 저장한다.
        upLoadNickname().then(
          function(success) {
            hideLoading();
          },
          function(error) {
            hideLoading();
          }
        );
      },
      function(error) {
        if (error.code == "auth/email-already-in-use") {
          signin(email, pwd);
          return;
        } else if (error.code == "auth/invalid-email") {
          alert("잘못된 이메일 입니다.");
        } else if (error.code == "auth/weak-password") {
          alert("잘못된 비밀번호 입니다.");
        }
        hideLoading();
      }
    );
}
// 로그인을 진행한다.
function signin(email, pwd) {
  firebase
    .auth()
    .signInWithEmailAndPassword(email, pwd)
    .then(
      function(success) {
        hideLoading();
      },
      function(error) {
        console.log(error);
        hideLoading();
      }
    );
}

// 로그인 버튼 클릭시 실행
$("#login-btn").click(function() {
  if ($("#login-btn").hasClass("enable-login")) {
    signup();
  }
});

// 로그인 시 사용자의 데이터를 가져온다.
function loadData() {
  // 닉네임을 가져온다.
  getNickname()
    .once("value")
    .then(
      function(success) {
        var userNickname = success.val();
        setNicknameWeb(userNickname);
        hideLoginShowChat();
        hideLoading();
        chatDBListenner();
      },
      function(error) {
        showLoginHideChat();
        hideLoading();
      }
    );
}

function hideLoginShowChat() {
  hideKakaoLoginWrapper();
  showChatWrapper();
  resetLogin();
  onlineCheck();
}

// 사용자 입장 여부를 체크 한다.
function onlineCheck() {
  // DB에서 UsersConnection/$Uid/connection 접근 경로를 설정한다.
  var myConnectionsRef = firebase
    .database()
    .ref("UsersConnection/" + getCurrentUid() + "/connection");

  // DB에서 .info/connected 접근 경로를 설정한다.
  var connectedRef = firebase.database().ref(".info/connected");
  connectedRef.on("value", function(snap) {
    if (snap.val() === true) {
      // DB 접근이 허용될 경우 실행

      // 해당 사용자의 connection 여부를 true로 변경시킨다.
      myConnectionsRef.set(true).then(function() {
        // DB에서 UsersConnection/ 이후 데이터의 변화를 감지한다.
        UsersConnectionChangeListenner();

        // DB에서 UsersConnection/ 이후의 새로운 데이터 추가를 감지한다.
        UsersConnectionAddListenner();
      });

      // 해당 사용자의 connection이 끊어지면 false로 변경시켜준다.
      myConnectionsRef.onDisconnect().set(false);
    }
  });
}

// 채팅 내용이 DB에서 업데이트를 감지한다.
function chatDBListenner() {
  firebase
    .database()
    .ref("chat/")
    .orderByKey()
    .startAt(Date.now() + "")
    .on("child_added", function(success) {
      var receiveChatData = success.val();

      if (receiveChatData.uid != getCurrentUid()) {
        // 자신의 Uid와 다를 경우 실행된다.
        // 다른 사용자의 채팅을 감지한다.

        // 다른 사용자의 채팅을 WEB에 보여준다.
        makeOtherChat(receiveChatData.nickName, receiveChatData.contents);
      }
    });
}

// DB에서 사용자 접속 데이터의 변화를 감지한다.
function UsersConnectionChangeListenner() {
  firebase
    .database()
    .ref("UsersConnection/")
    .on(
      "child_changed",
      function(snap) {
        // 데이터의 변화가 감지되면 현재 입장한 사용자 데이터를 업데이트한다.
        getOnlineUser();
      },
      function(error) {
        console.log(error);
      }
    );
}

// DB에서 사용자 접속 데이터의 새로운 추가를 감지한다.
function UsersConnectionAddListenner() {
  firebase
    .database()
    .ref("UsersConnection/")
    .on(
      "child_added",
      function(snap) {
        // 새로운 데이터가 추가되면 현재 입장한 사용자 데이터를 업데이트한다.
        getOnlineUser();
      },
      function(error) {
        console.log(error);
      }
    );
}

// 현재 접속자 데이터를 업데이트한다.
function getOnlineUser() {
  // DB의 UsersConnection/$uid/connection 경로에 true값들의 수를 가져온다.
  firebase
    .database()
    .ref("UsersConnection/")
    .orderByChild("connection")
    .equalTo(true)
    .once(
      "value",
      function(snap) {
        // 입장 인원을 WEB에 보여준다.
        var onlineUser = Object.keys(snap.val()).length;
        setOnlineNumber(onlineUser);
      },
      function(error) {
        console.log(error);
      }
    );
}

// 채팅 데이터를 전송한다.
function sendText() {
  if (getInputChat().length > 0) {
    upLoadChat(getInputChat());
    $("#input-chat").val("");
    disableTextSend();
  }
}

// 채팅창에서 키보드 입력을 컨트롤 한다.
$("#input-chat").keyup(function(event) {
  if (event.keyCode == 8) {
    if (getInputChat().length <= 1) {
      disableTextSend();
    }
  } else {
    if (getInputChat().length > 0) {
      enableTextSend();
    }
  }
});

// 채팅창에서 키보드 입력을 컨트롤 한다.
$("#input-chat").keypress(function(event) {
  if (event.keyCode == 13) {
    if (!event.shiftKey) {
      event.preventDefault();
      sendText();
    }
  } else {
    if (getInputChat().length > 0) {
      enableTextSend();
    } else {
      disableTextSend();
    }
  }
});

// 전송 버튼 클릭 시 실행
$("#text-send").click(function() {
  sendText();
});

// 채팅 내용을 DB에 업로드 한다.
function upLoadChat(contents) {
  getNickname()
    .once("value")
    .then(function(success) {
      firebase
        .database()
        .ref("chat/" + Date.now())
        .update({
          nickName: success.val(),
          email: firebase.auth().currentUser.email,
          contents: contents,
          uid: getCurrentUid()
        });
    });
  makeMyChat(contents);
}

// 수정 버튼 클릭시 실행
$("#user-nic-modify").click(function() {
  var modifyNic = prompt("수정하실 닉네임을 작성하여주세요.");

  if (modifyNic.length > 1 && modifyNic.length < 7) {
    updateNickname(modifyNic).then(
      function(success) {
        setNicknameWeb(modifyNic);
        alert("수정이 완료되었습니다.");
      },
      function(error) {
        alert("수정에 실패하였습니다.");
      }
    );
  } else {
    alert("수정에 실패하였습니다.");
  }
});

// 로그아웃 버튼 클릭시 실행
$("#logout-btn").click(function() {
  if (confirm("로그아웃 하시겠습니까?")) {
    var myConnectionsRef = firebase
      .database()
      .ref("UsersConnection/" + getCurrentUid() + "/connection");
    myConnectionsRef.set(false);
    firebase.auth().signOut();
    showLoginHideChat();
  }
});

// 채팅화면이 사라지면서 로그인 화면이 나타난다.
function showLoginHideChat() {
  showKakaoLoginWrapper();
  hideChatWrapper();
  removeChatData();
}

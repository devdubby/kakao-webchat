function getEmail() {
  return $("#kakao-email").val();
}

function getPassword() {
  return $("#kakao-pw").val();
}

function enableLogin() {
  $("#login-btn").addClass("enable-login");
  $("#login-btn").removeClass("disable-login");
}

function disableLogin() {
  $("#login-btn").removeClass("enable-login");
  $("#login-btn").addClass("disable-login");
}

function showErrorLog() {
  $("#login-err").show();
}

function hideErrorLog() {
  $("#login-err").hide();
}

function disableTextSend() {
  $("#text-send").addClass("disable-text-send");
  $("#text-send").removeClass("enable-text-send");
}

function enableTextSend() {
  $("#text-send").removeClass("disable-text-send");
  $("#text-send").addClass("enable-text-send");
}

function getInputChat() {
  return $("#input-chat").val();
}

function makeMyChat(contents) {
  $("#chat-contents-wrapper").append(
    "<div>" +
      "<div class='my-chat'>" +
      "<pre class='my-chat-contents'>" +
      contents +
      "</pre>" +
      "</div>" +
      "</div>"
  );
  scrollBottom();
}

function makeOtherChat(nickName, contents) {
  $("#chat-contents-wrapper").append(
    "<div>" +
      "<div class='other-chat'>" +
      "<pre class='other-nic'>" +
      nickName +
      "</pre>" +
      "<pre class='other-chat-contents'>" +
      contents +
      "</pre>" +
      "</div>" +
      "</div>"
  );
  scrollBottom();
}

function scrollBottom() {
  $("#chat-contents-wrapper")
    .stop()
    .animate(
      { scrollTop: $("#chat-contents-wrapper")[0].scrollHeight },
      "slow"
    );
}

function getNickname() {
  return firebase.database().ref("users/" + getCurrentUid() + "/nickName");
}

function updateNickname(nickName) {
  return firebase
    .database()
    .ref("users/" + getCurrentUid())
    .update({ nickName: nickName });
}

function upLoadNickname(uid) {
  return firebase
    .database()
    .ref("users/" + getCurrentUid())
    .set({
      email: getEmail(),
      nickName: getEmail()
    });
}

function setNicknameWeb(nickName) {
  $("#user-nic").text(nickName);
}

function setOnlineNumber(onlineNum) {
  $("#online-num").text(onlineNum);
}

function getCurrentUid() {
  return firebase.auth().getUid();
}

function hideKakaoLoginWrapper() {
  $("#kakao-wrapper").removeClass("show-kakao-wrapper");
  $("#kakao-wrapper").addClass("hide-kakao-wrapper");
}

function showChatWrapper() {
  $("#kakao-chat-wrapper").addClass("show-kakao-chat-wrapper");
  $("#kakao-chat-wrapper").removeClass("hide-kakao-chat-wrapper");
}

function resetLogin() {
  $("#kakao-email").val("");
  $("#kakao-pw").val("");
}

function showLoading() {
  $("#spinner-warpper").show();
}

function hideLoading() {
  $("#spinner-warpper").hide();
}

function hideChatWrapper() {
  $("#kakao-chat-wrapper").removeClass("show-kakao-chat-wrapper");
  $("#kakao-chat-wrapper").addClass("hide-kakao-chat-wrapper");
}

function showKakaoLoginWrapper() {
  $("#kakao-wrapper").addClass("show-kakao-wrapper");
  $("#kakao-wrapper").removeClass("hide-kakao-wrapper");
}

function removeChatData() {
  firebase
    .database()
    .ref("chat/")
    .off();
  $("#chat-contents-wrapper")
    .children()
    .remove();
}

// 初始化 LeanCloud
AV.init({
  appId: '0lpjg6Zgwua9jqUZDeJMVxpr-gzGzoHsz',
  appKey: 'gV34QMHiVXzzDiS4GdyXtZt9',
  serverURL: 'https://0lpjg6zg.lc-cn-n1-shared.com'
});

// 更新用户状态，控制欢迎信息与个人中心显示
function updateUserStatus() {
  const user = AV.User.current();
  const infoEl = $('#userInfo');
  const panel = $('#floatingUserPanel');
  const toggleBtn = $('#toggleUserPanel');
  const tip = $('#loginFloatTip');

  if (user) {
    const email = user.getEmail();
    const username = user.getUsername();
    const created = new Date(user.createdAt).toLocaleString();
    const updated = new Date(user.updatedAt).toLocaleString();
    const id = user.id;

    infoEl.html(`欢迎：${username} <span id="logoutBtn">退出</span>`);
    $('#loginButton').hide();
    tip.hide();

    // 显示浮窗
    $('#pc-username').text(username);
    $('#pc-email').text(email || '未绑定');
    $('#pc-userid').text(id);
    $('#pc-created').text(created);
    $('#pc-login').text(updated);
    panel.addClass('active');
    toggleBtn.addClass('active').text('收起');
  } else {
    infoEl.empty();
    $('#loginButton').show();
    panel.removeClass('active');
    toggleBtn.removeClass('active');
    tip.show();
  }
}

// 悬浮窗切换按钮
$(document).on('click', '#toggleUserPanel', function () {
  const panel = $('#floatingUserPanel');
  const btn = $(this);
  if (panel.hasClass('active')) {
    panel.removeClass('active');
    btn.text('展开个人中心');
  } else {
    panel.addClass('active');
    btn.text('收起');
  }
});

// 文档加载完成
$(document).ready(function () {
  updateUserStatus();

  // 登录弹窗显示
  $('#loginButton').click(() => $('#loginModal').addClass('active'));
  $('#closeLogin').click(() => $('#loginModal').removeClass('active'));

  // 注册功能
  $('#signupBtn').click(async () => {
    const email = $('#loginEmail').val();
    const password = $('#loginPassword').val();
    if (!email || !password) return alert("请填写完整信息");
    const user = new AV.User();
    user.setUsername(email);
    user.setPassword(password);
    user.setEmail(email);
    try {
      await user.signUp();
      alert("注册成功！");
      $('#loginModal').removeClass('active');
      updateUserStatus();
    } catch (err) {
      alert("注册失败：" + err.message);
    }
  });

  // 登录功能
  $('#loginBtn').click(async () => {
    const email = $('#loginEmail').val();
    const password = $('#loginPassword').val();
    if (!email || !password) return alert("请填写完整信息");
    try {
      await AV.User.logIn(email, password);
      alert("登录成功！");
      $('#loginModal').removeClass('active');
      updateUserStatus();
    } catch (err) {
      alert("登录失败：" + err.message);
    }
  });

  // 登出功能
  $(document).on('click', '#logoutBtn, #logoutBtnBox', async () => {
    await AV.User.logOut();
    alert("已退出");
    updateUserStatus();
  });

  // 平滑滚动锚点
  $("a").on("click", function (event) {
    if (this.hash !== "") {
      event.preventDefault();
      const hash = this.hash;
      const targetOffset = $(hash).offset().top - 80;
      $("html, body").animate(
        { scrollTop: targetOffset },
        800,
        () => window.history.pushState(null, null, hash)
      );
    }
  });

  // 导航栏滚动效果
  $(window).scroll(function () {
    $(".navbar").toggleClass("scrolled", $(this).scrollTop() > 50);
  });

  // 移动端菜单切换
  $(".hamburger").click(function () {
    $(this).toggleClass("active");
    $(".nav-links").toggleClass("active");
    $("body").toggleClass("no-scroll");
  });

  // 工具站点折叠
  $("#tools .section-title").click(function () {
    const $container = $(".tools-container");
    const $icon = $(this).find(".toggle-icon");
    $icon.toggleClass("active");
    $container.toggleClass("active");
    $container.css("max-height", $container.hasClass("active") ? $container[0].scrollHeight + "px" : "0");
  });

  // 视频弹窗控制
  const videoModal = $("#videoModal");
  const video = $("#videoModal video")[0];
  $("#watch-performance").click(function (e) {
    e.preventDefault();
    videoModal.addClass("active");
    video.play().catch((error) => console.log("视频播放失败:", error));
  });

  $(".close-video, #videoModal").click(function (e) {
    if (e.target === this) {
      videoModal.removeClass("active");
      video.pause();
    }
  });

  // 图片懒加载
  const lazyImages = $("img[data-src]");
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        imageObserver.unobserve(img);
      }
    });
  });
  lazyImages.each((i, img) => imageObserver.observe(img));

  // 卡片悬停效果
  $(".achievement-card, .teacher-card, .tool-card").hover(
    () => $(this).addClass("hover"),
    () => $(this).removeClass("hover")
  );

  // 窗口尺寸调整
  $(window).resize(function () {
    // 响应式导航栏
    if ($(window).width() > 768) {
      $(".hamburger").removeClass("active");
      $(".nav-links").removeClass("active");
      $("body").removeClass("no-scroll");
    }

    // 调整个人中心按钮位置
    $('#toggleUserPanel').css(
      'right',
      $(window).width() < 768 ? '20px' : '340px'
    );
  });

  // 加载动画
  const loader = document.querySelector(".loader");
  if (loader) {
    loader.classList.add("hidden");
    setTimeout(() => loader.remove(), 500);
  }
});
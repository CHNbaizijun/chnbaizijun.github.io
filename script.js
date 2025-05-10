AV.init({
  appId: '0lpjg6Zgwua9jqUZDeJMVxpr-gzGzoHsz',
  appKey: 'gV34QMHiVXzzDiS4GdyXtZt9',
  serverURL: 'https://0lpjzgw.lc-cn-n1-shared.com'
});

function updateUserStatus() {
  const user = AV.User.current();
  const overlay = $('#authOverlay');
  
  if (!user) {
    if (overlay.length === 0) {
      $('body').append(`
        <div id="authOverlay">
            <div id="authMessage">请登录后查看页面</div>
            <button class="cta-button" id="overlayLoginButton">
                立即登录
            </button>
        </div>
      `);
    }
    $('section:not(#home), footer').hide();
  } else {
    $('#authOverlay').remove();
    $('section, footer').show();
  }

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

$(document).ready(function () {
  updateUserStatus();

  $('#loginButton, #overlayLoginButton').click(function () {
    $('#loginModal').addClass('active');
    $('body').addClass('no-scroll');
  });
  
  $('#closeLogin').click(function () {
    $('#loginModal').removeClass('active');
    $('body').removeClass('no-scroll');
  });

  $("a[href^='#']").on("click", function (event) { 
    event.preventDefault();
    const hash = this.hash;
    if (!$(hash).length) return; 
    
    const targetOffset = $(hash).offset().top - 80;
    $("html, body").animate(
        { scrollTop: targetOffset },
        800,
        () => window.history.pushState(null, null, hash)
    );
  });

  $(document).on('click', '.tab', function() {
    const tab = $(this).data('tab');
    $('.tab').removeClass('active');
    $(this).addClass('active');
    $('.tab-page').removeClass('active');
    $(`#${tab}Page`).addClass('active');
  });

  // 修改后的注册逻辑
  $('#signupBtn').click(async () => {
    const nickname = $('#signupNickname').val().trim();
    const email = $('#signupEmail').val().trim();
    const password = $('#signupPassword').val();
    const passwordConfirm = $('#signupPasswordConfirm').val();

    if (!nickname || nickname.length < 2 || nickname.length > 16) {
      return showError('昵称需为2-16位字符');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return showError('请输入有效的邮箱地址');
    }
    if (password.length < 8) {
      return showError('密码长度至少8位');
    }
    if (password !== passwordConfirm) {
      return showError('两次输入的密码不一致');
    }
    if (!$('#agreeTerms').prop('checked')) {
      return showError('请同意用户协议');
    }

    try {
      const user = new AV.User();
      user.setUsername(nickname);
      user.setPassword(password);
      user.setEmail(email);
      user.set('nickname', nickname);
      
      await user.signUp();
      
      // 发送验证邮件
      await AV.User.requestEmailVerify(email);
      
      // 强制退出当前用户
      await AV.User.logOut();

      // 显示嵌入式弹窗
      $('#regVerifyAlert').addClass('active');
      // 8秒后自动关闭
      setTimeout(() => {
        $('#regVerifyAlert').removeClass('active');
      }, 8000);

      // 关闭按钮事件
      $('.close-alert').click(() => {
        $('#regVerifyAlert').removeClass('active');
      });

      alert('注册成功！请检查您的注册邮箱完成验证后再登录');
      
      $('#loginModal').removeClass('active');
      $('body').removeClass('no-scroll');
      updateUserStatus();

    } catch (err) {
      showError(`注册失败：${err.message}`);
    }
  });

  $('#signupPassword').on('input', function() {
    const strength = checkPasswordStrength($(this).val());
    $('.password-strength').attr('class', 'password-strength ' + strength);
  });

  function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^A-Za-z0-9]/)) strength++;
    
    return strength > 3 ? 'strong' : strength > 1 ? 'medium' : 'weak';
  }

  $('#forgotBtn').click(async () => {
    const email = $('#forgotEmail').val().trim();
    if (!validateEmail(email)) return showError('请输入有效邮箱地址');
    
    try {
      await AV.User.requestPasswordReset(email);
      alert('密码重置邮件已发送至您的邮箱');
      $('#loginModal').removeClass('active');
      $('body').removeClass('no-scroll');
    } catch (err) {
      showError(`操作失败：${err.message}`);
    }
  });

  // 修改后的登录逻辑
  $('#loginBtn').click(async () => {
    const email = $('#loginEmail').val();
    const password = $('#loginPassword').val();
    if (!email || !password) return alert("请填写完整信息");
    try {
      const user = await AV.User.logIn(email, password);
      
      // 检查邮箱是否已验证
      if (!user.get('emailVerified')) {
        await AV.User.logOut(); 
        alert("安全提示：请到您的电子邮箱验证账户后再登录！");
        return;
      }

      alert("登录成功！");
      $('#loginModal').removeClass('active');
      $('body').removeClass('no-scroll');
      updateUserStatus();
      
    } catch (err) {
      // 错误信息定制
      if (err.message.includes("Email address isn't verified")) {
        alert("安全提示：请到您的电子邮箱验证账户后再登录！");
      } else {
        alert("登录失败：" + err.message);
      }
    }
  });

  $(document).on('click', '#logoutBtn, #logoutBtnBox', async () => {
    await AV.User.logOut();
    alert("已退出");
    updateUserStatus();
  });

  $(window).scroll(function () {
    $(".navbar").toggleClass("scrolled", $(this).scrollTop() > 50);
  });

  $(".hamburger").click(function () {
    $(this).toggleClass("active");
    $(".nav-links").toggleClass("active");
    $("body").toggleClass("no-scroll");
  });

  $("#tools .section-title").click(function () {
    const $container = $(".tools-container");
    const $icon = $(this).find(".toggle-icon");
    $icon.toggleClass("active");
    $container.toggleClass("active");
    $container.css("max-height", $container.hasClass("active") ? $container[0].scrollHeight + "px" : "0");
  });

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

  $(".achievement-card, .teacher-card, .tool-card").hover(
    () => $(this).addClass("hover"),
    () => $(this).removeClass("hover")
  );

  $(window).resize(function () {
    if ($(window).width() > 768) {
      $(".hamburger").removeClass("active");
      $(".nav-links").removeClass("active");
      $("body").removeClass("no-scroll");
    }

    $('#toggleUserPanel').css(
      'right',
      $(window).width() < 768 ? '20px' : '340px'
    );
  });

  const loader = document.querySelector(".loader");
  if (loader) {
    loader.classList.add("hidden");
    setTimeout(() => loader.remove(), 500);
  }

  // 重新发送验证邮件
  async function resendVerifyEmail() {
    const email = $('#signupEmail').val().trim();
    if (!validateEmail(email)) return showError('请输入有效邮箱地址');
    
    try {
      await AV.User.requestEmailVerify(email);
      $('#emailVerifyTip').fadeIn().delay(3000).fadeOut();
      alert('验证邮件已重新发送');
    } catch (err) {
      showError(`发送失败：${err.message}`);
    }
  }

  function showError(msg) {
    const $error = $('.tab-page.active').find('.error-message');
    $error.text(msg).fadeIn().delay(3000).fadeOut();
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  $(document).on('click', '[data-auth]', function(e) {
    e.preventDefault();
    if (!AV.User.current()) {
        $('#loginModal').addClass('active');
        $('body').addClass('no-scroll');
    }
  });
});
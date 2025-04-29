// script.js
$(document).ready(function(){
    // 平滑滚动
    $("a").on('click', function(event) {
        if (this.hash !== "") {
            event.preventDefault();
            const hash = this.hash;
            const targetOffset = $(hash).offset().top - 80;
            
            $('html, body').animate({
                scrollTop: targetOffset
            }, 800, function(){
                window.history.pushState(null, null, hash);
            });
        }
    });

    // 导航栏滚动效果
    $(window).scroll(function() {
        $('.navbar').toggleClass('scrolled', $(this).scrollTop() > 50);
    });

    // 移动端菜单切换
    $('.hamburger').click(function() {
        $(this).toggleClass('active');
        $('.nav-links').toggleClass('active');
        $('body').toggleClass('no-scroll');
    });

    // 工具站点折叠功能
    $('#tools .section-title').click(function() {
        const $container = $('.tools-container');
        const $icon = $(this).find('.toggle-icon');
        
        $icon.toggleClass('active');
        $container.toggleClass('active');
        
        if ($container.hasClass('active')) {
            $container.css('max-height', $container[0].scrollHeight + 'px');
        } else {
            $container.css('max-height', '0');
        }
    });

    // 视频模态框控制
    const videoModal = $('#videoModal');
    const video = $('#videoModal video')[0];

    $('#watch-performance').click(function(e) {
        e.preventDefault();
        videoModal.addClass('active');
        video.play().catch(error => console.log('视频播放失败:', error));
    });

    $('.close-video, #videoModal').click(function(e) {
        if (e.target === this) {
            videoModal.removeClass('active');
            video.pause();
        }
    });

    // 图片懒加载
    const lazyImages = $('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    lazyImages.each((i, img) => imageObserver.observe(img));

    // 卡片悬停效果
    $('.achievement-card, .teacher-card, .tool-card').hover(
        function() { $(this).addClass('hover'); },
        function() { $(this).removeClass('hover'); }
    );

    // 自动关闭移动端菜单
    $(window).resize(function() {
        if ($(window).width() > 768) {
            $('.hamburger').removeClass('active');
            $('.nav-links').removeClass('active');
            $('body').removeClass('no-scroll');
        }
    });
});

// 页面加载动画
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 500);
    }
});

// 登录弹窗控制
$(document).ready(function(){
    $('#loginButton').click(function(){
        $('#loginModal').addClass('active');
    });

    $('#closeLogin').click(function(){
        $('#loginModal').removeClass('active');
    });

    // 注册按钮点击
    $('#signupBtn').click(function(){
        const email = $('#loginEmail').val();
        const password = $('#loginPassword').val();
        if(email && password) {
            alert('注册成功（模拟功能）');
            $('#loginModal').removeClass('active');
        } else {
            alert('请填写完整信息');
        }
    });

    // 登录按钮点击
    $('#loginBtn').click(function(){
        const email = $('#loginEmail').val();
        const password = $('#loginPassword').val();
        if(email && password) {
            alert('登录成功（模拟功能）');
            $('#loginModal').removeClass('active');
        } else {
            alert('请填写完整信息');
        }
    });
});

-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: sql113.infinityfree.com
-- Thời gian đã tạo: Th8 17, 2025 lúc 09:20 AM
-- Phiên bản máy phục vụ: 11.4.7-MariaDB
-- Phiên bản PHP: 7.2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `if0_39722476_vong_quay_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `role` enum('admin','manager','staff') DEFAULT 'staff',
  `is_active` tinyint(1) DEFAULT 1,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `password_hash`, `email`, `full_name`, `role`, `is_active`, `last_login_at`, `created_at`) VALUES
(1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'Administrator', 'admin', 1, NULL, '2025-08-07 02:23:16');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `facebook_messages`
--

CREATE TABLE `facebook_messages` (
  `id` int(11) NOT NULL,
  `facebook_user_id` int(11) NOT NULL,
  `message_type` enum('text','image','video','audio','file') DEFAULT 'text',
  `message_content` text DEFAULT NULL COMMENT 'Nội dung tin nhắn',
  `message_time` datetime DEFAULT current_timestamp(),
  `is_from_user` tinyint(1) DEFAULT 1 COMMENT 'Tin nhắn từ user hay bot',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Đang đổ dữ liệu cho bảng `facebook_messages`
--

INSERT INTO `facebook_messages` (`id`, `facebook_user_id`, `message_type`, `message_content`, `message_time`, `is_from_user`, `created_at`) VALUES
(1, 1, 'text', 'Chào admin, tôi mu?n h?i v? ch??ng trình vòng quay', '2025-08-17 05:04:57', 1, '2025-08-17 05:04:57'),
(2, 1, 'text', 'Chào b?n! Ch??ng trình vòng quay ?ang di?n ra hàng ngày', '2025-08-17 05:04:57', 0, '2025-08-17 05:04:57'),
(3, 2, 'text', 'Làm sao ?? tham gia vòng quay v?y admin?', '2025-08-17 05:04:57', 1, '2025-08-17 05:04:57'),
(4, 2, 'text', 'B?n ch? c?n nh?n tin cho page là có th? tham gia ngay', '2025-08-17 05:04:57', 0, '2025-08-17 05:04:57'),
(5, 3, 'text', 'Tôi ?ã trúng gi?i th??ng, khi nào có th? nh?n?', '2025-08-17 05:04:57', 1, '2025-08-17 05:04:57'),
(6, 4, 'text', 'Admin ?i, voucher có h?n s? d?ng không?', '2025-08-17 05:04:57', 1, '2025-08-17 05:04:57'),
(7, 5, 'text', 'Hi admin', '2025-08-17 05:04:57', 1, '2025-08-17 05:04:57');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `facebook_users`
--

CREATE TABLE `facebook_users` (
  `id` int(11) NOT NULL,
  `facebook_id` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `avatar_url` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `first_message_time` datetime DEFAULT current_timestamp(),
  `last_message_time` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `total_messages` int(11) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Đang đổ dữ liệu cho bảng `facebook_users`
--

INSERT INTO `facebook_users` (`id`, `facebook_id`, `full_name`, `avatar_url`, `phone`, `email`, `first_message_time`, `last_message_time`, `total_messages`, `is_active`, `notes`, `created_at`, `updated_at`) VALUES
(1, '123456789', 'Nguy?n V?n An', NULL, '0901234567', 'nguyenvana@gmail.com', '2025-08-17 05:27:47', '2025-08-17 05:27:47', 1, 1, 'User test 1', '2025-08-17 05:27:47', '2025-08-17 05:27:47'),
(2, '987654321', 'Tr?n Th? Bình', NULL, '0987654321', 'tranthib@gmail.com', '2025-08-17 05:27:47', '2025-08-17 05:27:47', 1, 1, 'User test 2', '2025-08-17 05:27:47', '2025-08-17 05:27:47'),
(3, '555666777', 'Lê V?n C??ng', NULL, '0555666777', 'levanc@gmail.com', '2025-08-17 05:27:47', '2025-08-17 05:27:47', 1, 1, 'User test 3', '2025-08-17 05:27:47', '2025-08-17 05:27:47'),
(4, 'test123', 'Test User', NULL, '0123456789', 'test@example.com', '2025-08-17 06:11:55', '2025-08-17 06:11:55', 1, 1, NULL, '2025-08-17 06:11:55', '2025-08-17 06:11:55');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `facebook_user_messages`
--

CREATE TABLE `facebook_user_messages` (
  `id` int(11) NOT NULL,
  `facebook_user_id` int(11) NOT NULL,
  `message_text` text DEFAULT NULL,
  `message_type` enum('text','attachment','quick_reply') DEFAULT 'text',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `facebook_user_prizes`
--

CREATE TABLE `facebook_user_prizes` (
  `id` int(11) NOT NULL,
  `facebook_user_id` int(11) NOT NULL,
  `prize_name` varchar(255) NOT NULL COMMENT 'Tên giải thưởng',
  `prize_value` decimal(10,2) DEFAULT 0.00 COMMENT 'Giá trị giải thưởng',
  `won_date` datetime DEFAULT current_timestamp() COMMENT 'Ngày trúng thưởng',
  `is_claimed` tinyint(1) DEFAULT 0 COMMENT 'Đã nhận thưởng chưa',
  `claim_date` datetime DEFAULT NULL COMMENT 'Ngày nhận thưởng',
  `claim_method` enum('store','delivery','online') DEFAULT NULL COMMENT 'Cách thức nhận thưởng',
  `admin_notes` text DEFAULT NULL COMMENT 'Ghi chú của admin',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Đang đổ dữ liệu cho bảng `facebook_user_prizes`
--

INSERT INTO `facebook_user_prizes` (`id`, `facebook_user_id`, `prize_name`, `prize_value`, `won_date`, `is_claimed`, `claim_date`, `claim_method`, `admin_notes`, `created_at`) VALUES
(1, 1, 'Phi?u gi?m giá 50K', '50000.00', '2025-08-17 05:27:47', 0, NULL, NULL, NULL, '2025-08-17 05:27:47'),
(2, 1, 'Áo thun', '150000.00', '2025-08-17 05:27:47', 1, NULL, NULL, NULL, '2025-08-17 05:27:47'),
(3, 2, 'Voucher 100K', '100000.00', '2025-08-17 05:27:47', 0, NULL, NULL, NULL, '2025-08-17 05:27:47'),
(4, 3, 'Cà phê mi?n phí', '25000.00', '2025-08-17 05:27:47', 1, NULL, NULL, NULL, '2025-08-17 05:27:47');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `players`
--

CREATE TABLE `players` (
  `id` int(11) NOT NULL,
  `phone` varchar(20) DEFAULT NULL COMMENT 'Số điện thoại',
  `email` varchar(255) DEFAULT NULL COMMENT 'Email',
  `name` varchar(255) DEFAULT NULL COMMENT 'Tên người chơi',
  `device_fingerprint` varchar(255) DEFAULT NULL COMMENT 'Mã định danh thiết bị',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'Địa chỉ IP',
  `user_agent` text DEFAULT NULL COMMENT 'Thông tin trình duyệt',
  `first_play_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Lần đầu chơi',
  `last_play_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Lần chơi cuối',
  `total_plays` int(11) DEFAULT 0 COMMENT 'Tổng số lần chơi',
  `is_verified` tinyint(1) DEFAULT 0 COMMENT 'Đã xác minh số điện thoại/email',
  `is_blocked` tinyint(1) DEFAULT 0 COMMENT 'Có bị chặn không',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `prizes`
--

CREATE TABLE `prizes` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'Tên giải thưởng',
  `description` text DEFAULT NULL COMMENT 'Mô tả giải thưởng',
  `image_url` varchar(500) DEFAULT NULL COMMENT 'Hình ảnh giải thưởng',
  `probability` decimal(6,2) NOT NULL DEFAULT 0.00,
  `quantity` int(11) DEFAULT -1 COMMENT 'Số lượng giải (-1 = không giới hạn)',
  `remaining_quantity` int(11) DEFAULT -1 COMMENT 'Số lượng còn lại',
  `value` decimal(10,2) DEFAULT 0.00 COMMENT 'Giá trị giải thưởng',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Có hoạt động không',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `prizes`
--

INSERT INTO `prizes` (`id`, `name`, `description`, `image_url`, `probability`, `quantity`, `remaining_quantity`, `value`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'CÔ CA CÔ LA', '👉 Thưởng thức ngay chai nước giải khát Coca Cola mát lạnh, sảng khoái tức thì.', NULL, '2.00', -1, 10, '0.00', 1, '2025-08-16 23:04:14', '2025-08-17 00:56:24'),
(2, 'VOUCHER 20K', '👉 Phiếu mua hàng trị giá 20.000 VNĐ, áp dụng cho nhiều sản phẩm hấp dẫn.', NULL, '30.00', -1, 0, '20000.00', 1, '2025-08-16 23:04:14', '2025-08-16 21:57:00'),
(3, 'XÔI LẠC, NGÔ, GẤC', '👉 Một phần xôi nóng hổi, thơm ngon – lựa chọn theo sở thích: xôi lạc, xôi ngô hoặc xôi gấc.', NULL, '1.00', -1, 7, '0.00', 1, '2025-08-16 23:04:14', '2025-08-16 23:27:53'),
(4, '1 THÁNG ĂN BÁNH MÌ CÓC', '👉 Ăn bánh mì thỏa thích trong 1 tháng – no căng bụng, vui cả ngày.', NULL, '1.00', -1, 2, '0.00', 1, '2025-08-16 23:04:14', '2025-08-17 00:56:11'),
(5, 'LY GIỮ NHIỆT INOX 304', '👉 Ly giữ nhiệt cao cấp, chất liệu inox 304 bền bỉ, sang trọng, giữ nóng – lạnh cực tốt.', NULL, '1.00', -1, 4, '0.00', 1, '2025-08-16 23:04:14', '2025-08-17 00:56:12'),
(6, 'VOUCHER 10K', '👉 Phiếu mua hàng trị giá 10.000 VNĐ, áp dụng linh hoạt.', NULL, '30.00', -1, 5, '10000.00', 1, '2025-08-16 23:04:14', '2025-08-17 12:01:22'),
(7, 'NƯỚC ÉP DƯA HẤU', '👉 Ly nước ép dưa hấu tươi mát, bổ dưỡng, giải nhiệt cực ngon.', NULL, '1.00', -1, 12, '0.00', 1, '2025-08-16 23:04:14', '2025-08-17 00:56:15'),
(8, '1 THÁNG ĂN XÔI LẠC, XÉO, NGÔ, GẤC', '👉 Thỏa sức ăn xôi trong 1 tháng với đủ vị: xôi lạc, xôi ngô, xôi gấc.', NULL, '1.00', -1, 1, '0.00', 1, '2025-08-16 23:04:14', '2025-08-17 00:56:16'),
(9, 'LY GIỮ NHIỆT CAO CẤP', '👉 Ly giữ nhiệt Premium thiết kế hiện đại, giữ nhiệt lâu, phù hợp mọi nhu cầu.', NULL, '1.00', -1, 4, '0.00', 1, '2025-08-16 23:04:14', '2025-08-17 00:56:19'),
(10, 'VOUCHER 30K', '👉 Phiếu mua hàng trị giá 30.000 VNĐ, thoải mái lựa chọn sản phẩm yêu thích.', NULL, '30.00', -1, 0, '30000.00', 1, '2025-08-16 23:04:14', '2025-08-16 21:56:55'),
(11, 'BÁNH MÌ CÓC', '👉 Một ổ bánh mì giòn rụm, đầy ắp nhân, thơm ngon khó cưỡng.', NULL, '1.00', -1, 13, '0.00', 1, '2025-08-16 23:04:14', '2025-08-17 06:34:08'),
(12, '1 THÁNG UỐNG NƯỚC ÉP DƯA HẤU, CAM', '👉 Uống nước ép tươi ngon (dưa hấu, cam) miễn phí trong 1 tháng, giải khát cực đã.', NULL, '1.00', -1, 0, '0.00', 1, '2025-08-16 23:04:14', '2025-08-17 00:56:21');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `spin_history`
--

CREATE TABLE `spin_history` (
  `id` int(11) NOT NULL,
  `player_id` int(11) DEFAULT NULL,
  `prize_id` int(11) DEFAULT NULL COMMENT 'ID giải thưởng (NULL nếu không trúng)',
  `device_fingerprint` varchar(255) NOT NULL COMMENT 'Mã thiết bị',
  `ip_address` varchar(45) NOT NULL COMMENT 'IP address',
  `user_agent` text DEFAULT NULL COMMENT 'User agent',
  `phone_number` varchar(15) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL COMMENT 'Số điện thoại nhập sau khi trúng',
  `email` varchar(255) DEFAULT NULL COMMENT 'Email nhập sau khi trúng',
  `is_winner` tinyint(1) DEFAULT 0 COMMENT 'Có trúng thưởng không',
  `spin_result` varchar(100) DEFAULT NULL COMMENT 'Kết quả quay (tên giải)',
  `verification_status` enum('pending','verified','invalid') DEFAULT 'pending' COMMENT 'Trạng thái xác minh',
  `admin_notes` text DEFAULT NULL COMMENT 'Ghi chú của admin',
  `claimed_at` timestamp NULL DEFAULT NULL COMMENT 'Thời gian nhận thưởng',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `spin_history`
--

INSERT INTO `spin_history` (`id`, `player_id`, `prize_id`, `device_fingerprint`, `ip_address`, `user_agent`, `phone_number`, `phone`, `email`, `is_winner`, `spin_result`, `verification_status`, `admin_notes`, `claimed_at`, `created_at`) VALUES
(0, NULL, 6, 'TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IH', '171.241.56.180', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '0333041205', NULL, NULL, 1, 'VOUCHER 10K', 'pending', NULL, NULL, '2025-08-16 23:24:22'),
(0, NULL, 3, 'TW96aWxsYS81LjAgKGlQaG9uZTsgQ1BVIGlQaG9uZSBPUyAxOF', '14.171.203.234', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Zalo iOS/672 ZaloTheme/light ZaloLanguage/vn', '0973818627', NULL, 'thinh23111994@gmail.com', 1, 'XÔI LẠC, NGÔ, GẤC', 'pending', NULL, NULL, '2025-08-16 23:27:53'),
(0, NULL, 11, 'TW96aWxsYS81LjAgKGlQaG9uZTsgQ1BVIGlQaG9uZSBPUyAxOF', '113.23.122.50', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Zalo iOS/672 ZaloTheme/light ZaloLanguage/vn', '0973818627', NULL, 'thinh23111994@gmail.com', 1, 'BÁNH MÌ CÓC', 'pending', NULL, NULL, '2025-08-17 06:34:08'),
(0, NULL, 6, 'TW96aWxsYS81LjAgKGlQaG9uZTsgQ1BVIGlQaG9uZSBPUyAxOF', '113.23.122.50', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Zalo iOS/672 ZaloTheme/light ZaloLanguage/vn', '0339423343', NULL, 'vuthikimhoa277@gmail.com', 1, 'VOUCHER 10K', 'pending', NULL, NULL, '2025-08-17 07:00:36'),
(0, NULL, 6, 'TW96aWxsYS81LjAgKExpbnV4OyBBbmRyb2lkIDEwOyBTTS1BMT', '171.241.56.180', 'Mozilla/5.0 (Linux; Android 10; SM-A105G Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/139.0.7258.94 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/520.1.0.70.109;]', '0355010516', NULL, NULL, 1, 'VOUCHER 10K', 'pending', NULL, NULL, '2025-08-17 12:01:22');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `system_config`
--

CREATE TABLE `system_config` (
  `id` int(11) NOT NULL,
  `config_key` varchar(100) NOT NULL,
  `config_value` text DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `system_config`
--

INSERT INTO `system_config` (`id`, `config_key`, `config_value`, `description`, `updated_at`) VALUES
(1, 'max_plays_per_device_per_day', '3', 'Số lần quay tối đa mỗi thiết bị mỗi ngày', '2025-08-07 02:23:16'),
(2, 'max_plays_per_ip_per_day', '10', 'Số lần quay tối đa mỗi IP mỗi ngày', '2025-08-07 02:23:16'),
(3, 'require_phone_verification', 'true', 'Yêu cầu xác minh số điện thoại khi trúng thưởng', '2025-08-07 02:23:16'),
(4, 'require_email_verification', 'false', 'Yêu cầu xác minh email khi trúng thưởng', '2025-08-07 02:23:16'),
(5, 'game_title', 'Vòng Quay May Mắn', 'Tiêu đề trò chơi', '2025-08-07 02:23:16'),
(6, 'game_description', 'Quay số và nhận ngay quà tặng hấp dẫn!', 'Mô tả trò chơi', '2025-08-07 02:23:16'),
(7, 'contact_info', 'Hotline: 0123456789', 'Thông tin liên hệ', '2025-08-07 02:23:16'),
(8, 'store_address', '123 Đường ABC, Quận XYZ, TP.HCM', 'Địa chỉ cửa hàng để nhận quà', '2025-08-07 02:23:16');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `facebook_messages`
--
ALTER TABLE `facebook_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_facebook_messages_user_id` (`facebook_user_id`),
  ADD KEY `idx_facebook_messages_time` (`message_time`);

--
-- Chỉ mục cho bảng `facebook_users`
--
ALTER TABLE `facebook_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `facebook_id` (`facebook_id`);

--
-- Chỉ mục cho bảng `facebook_user_messages`
--
ALTER TABLE `facebook_user_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `facebook_user_id` (`facebook_user_id`);

--
-- Chỉ mục cho bảng `facebook_user_prizes`
--
ALTER TABLE `facebook_user_prizes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_facebook_user_prizes_user_id` (`facebook_user_id`),
  ADD KEY `idx_facebook_user_prizes_date` (`won_date`);

--
-- Chỉ mục cho bảng `players`
--
ALTER TABLE `players`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `facebook_messages`
--
ALTER TABLE `facebook_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `facebook_users`
--
ALTER TABLE `facebook_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `facebook_user_messages`
--
ALTER TABLE `facebook_user_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `facebook_user_prizes`
--
ALTER TABLE `facebook_user_prizes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `players`
--
ALTER TABLE `players`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

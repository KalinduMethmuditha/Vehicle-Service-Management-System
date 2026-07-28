<?php
$url = 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80';
$content = @file_get_contents($url);
if ($content) {
    @mkdir(__DIR__ . '/../public/images', 0777, true);
    file_put_contents(__DIR__ . '/../public/images/vehicle-service-hero.jpg', $content);
    echo "DOWNLOADED_SUCCESSFULLY";
} else {
    echo "DOWNLOAD_FAILED";
}

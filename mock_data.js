/**
 * Mock Data for Senior Mate's Backstage
 * This simulates the data structure we will eventually get from MicroCMS.
 */

const BLOG_POSTS = [
    {
        id: "20240106",
        title: "活動の合間の、ほっと一息。",
        published_date: "2024.01.06",
        author_info: "関東支部 千葉地区 大学2年生",
        name: "さくら",
        image: "images/IMG_02.JPG",
        category: ['thoughts'],
        summary: "練習の休憩時間、みんなで持ち寄ったお菓子を囲んで...",
        content: `
            <p>今日の練習は少しハードでしたが、休憩時間にはみんなで持ち寄ったお菓子を囲んでリラックスタイム。</p>
            <br>
            <p>「このお煎餅、どこで買ったの？」「孫がね、また大きくなって...」</p>
            <br>
            <p>たわいない会話ですが、こうして顔を合わせて笑い合う時間が、私たちのエネルギー源です。</p>
            <p>練習中の真剣な表情とはまた違う、柔らかい笑顔が溢れるこの「楽屋裏」の時間が、私はとても好きです。</p>
            <br>
            <p>次回の公演に向けて、また明日から頑張りましょう！</p>
        `
    },
    {
        id: "20240105",
        title: "新しい仲間が増えました！",
        published_date: "2024.01.05",
        author_info: "関東支部 東京地区 高3",
        name: "ゆうき",
        image: "images/mock_leaf.jpg", // Placeholder for 🌿
        emoji: "🌿", // Fallback if no image
        category: ['preparation'],
        summary: "今月から参加してくれた新しいシニアメイトをご紹介します...",
        content: `
            <p>今月から、私たちの活動に新しい仲間が加わってくれました！</p>
            <br>
            <p>以前から演劇に興味があったというAさん。「最初は緊張しましたが、皆さんが温かく迎えてくれて安心しました」と話してくれました。</p>
            <br>
            <p>新しい風が吹くと、私たち既存のメンバーも良い刺激を受けます。</p>
            <p>これから一緒にたくさんの物語を紡いでいけるのが楽しみです。</p>
        `
    },
    {
        id: "20240101",
        title: "新年のご挨拶",
        published_date: "2024.01.01",
        author_info: "関東支部 大学4年生",
        name: "リーダー",
        image: "images/mock_camera.jpg", // Placeholder for 📷
        category: ['thoughts'],
        emoji: "📷",
        summary: "あけましておめでとうございます。今年もシニアメイトは...",
        content: `
            <p>あけましておめでとうございます。</p>
            <p>今年もシニアメイトは、「ことば」と「こころ」を大切に活動してまいります。</p>
            <br>
            <p>昨年は多くの新しい挑戦がありましたが、今年はそれをさらに深めていく一年にしたいと思っています。</p>
            <p>本年もどうぞよろしくお願いいたします。</p>
        `
    }
];

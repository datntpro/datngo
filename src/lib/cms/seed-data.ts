export const SEED_USER = "public-seed";

export const seedSettings = {
  siteName: "Dat Ngo",
  tagline: "Ghi chú kỹ thuật. Hệ thống. Thẩm mỹ.",
  bio: "Kỹ sư viết về hạ tầng, bảo mật và cách làm sản phẩm có trọng lượng. Đóng tại Hà Nội.",
  aboutHtml: `<p>Tôi viết để làm rõ những quyết định mà team kỹ thuật thường để lại cho “người sau sẽ hiểu”. Ingress, GitOps, CVE, CMS, timing — cùng một thói quen: nhìn hệ thống như một văn bản có mục lục.</p>
<p>DATNGO là studio viết + nơi tôi xuất bản. Không newsletter hype, không thread 30 ảnh. Một bài, một luận điểm, một việc nên làm tiếp.</p>
<p>Đang xây <strong>Kairos</strong> — lớp tin tài chính và tín hiệu cá nhân — và giữ thói quen đọc security advisory mỗi ngày.</p>`,
  avatarUrl:
    "https://images.unsplash.com/photo-1521119989659-a83eee488efb?auto=format&fit=crop&w=640&q=80",
  xHandle: "datngotien",
  githubUrl: "https://github.com/datngotien",
  location: "Hà Nội",
  beehiivEmbedUrl: "",
  beehiivPublication: "field-notes",
  footerNote: "Viết chậm. Xuất bản khi chắc.",
};

export const seedTags = [
  {
    id: "tag-gitops",
    slug: "gitops",
    name: "GitOps",
    description: "Ranh giới trách nhiệm giữa app và platform.",
  },
  {
    id: "tag-security",
    slug: "security",
    name: "Security",
    description: "CVE, advisory, và cách đọc chúng như kỹ sư.",
  },
  {
    id: "tag-writing",
    slug: "writing",
    name: "Writing",
    description: "Kỹ thuật viết cho kỹ sư.",
  },
  {
    id: "tag-cms",
    slug: "cms",
    name: "CMS",
    description: "Công cụ xuất bản và SEO.",
  },
  {
    id: "tag-infra",
    slug: "infrastructure",
    name: "Infrastructure",
    description: "Kubernetes, mạng, vận hành.",
  },
];

export const seedMedia = [
  {
    id: "media-server-rack",
    url: "https://images.unsplash.com/photo-1558494949-ef0612f34881?auto=format&fit=crop&w=1600&q=80",
    alt: "Dãy server trong phòng máy lạnh, đèn status xanh",
    caption: "Hạ tầng là văn bản. Ingress là mục lục.",
    credit: "Unsplash / Taylor Vick",
  },
  {
    id: "media-code",
    url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1600&q=80",
    alt: "Màn hình code tối với cửa sổ terminal",
    caption: "Viết kỹ thuật cũng là thiết kế API cho người đọc.",
    credit: "Unsplash / James Harrison",
  },
  {
    id: "media-matrix",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80",
    alt: "Màn hình terminal đầy log",
    caption: "CVE không phải headline. Đó là thay đổi bề mặt tấn công.",
    credit: "Unsplash / Markus Spiske",
  },
  {
    id: "media-desk",
    url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=80",
    alt: "Bàn viết với giấy và bút máy",
    caption: "CMS tốt biến soạn thảo thành xuất bản, không phải upload file.",
    credit: "Unsplash / Aaron Burden",
  },
];

export const seedProjects = [
  {
    id: "proj-kairos",
    title: "Kairos",
    summary:
      "Lớp tin tài chính và tín hiệu cá nhân — editorial newspaper gặp terminal. Đang xây.",
    url: "",
    year: "2026",
    tags: "fintech, editorial",
    sortOrder: 0,
  },
  {
    id: "proj-fieldnotes",
    title: "DATNGO",
    summary: "Studio viết kỹ thuật, CMS riêng, SEO và review bài bằng AI.",
    url: "/",
    year: "2026",
    tags: "cms, writing",
    sortOrder: 1,
  },
  {
    id: "proj-gitops",
    title: "GitOps notes",
    summary: "Chuỗi ghi chú về ranh giới Ingress, ownership, và review config.",
    url: "/topics/gitops",
    year: "2026",
    tags: "kubernetes, gitops",
    sortOrder: 2,
  },
];

export type SeedPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  html: string;
  coverUrl: string;
  coverAlt: string;
  featured: boolean;
  publishedAt: string;
  focusKeyword: string;
  tagIds: string[];
};

export const seedPosts: SeedPost[] = [
  {
    id: "post-ingress",
    slug: "gitops-ai-so-huu-ingress",
    title: "GitOps: ai sở hữu Ingress?",
    excerpt:
      "App team commit annotation, platform team giữ class. Ranh giới này không phải sở thích — đó là bề mặt tấn công và tốc độ ship.",
    coverUrl: seedMedia[0].url,
    coverAlt: seedMedia[0].alt,
    featured: true,
    publishedAt: "2026-08-12T02:00:00.000Z",
    focusKeyword: "ingress gitops",
    tagIds: ["tag-gitops", "tag-infra"],
    html: `<p>Hầu hết tranh cãi GitOps không bắt đầu từ tool. Nó bắt đầu từ một file YAML mà hai team đều nghĩ là của mình. Ingress là file đó.</p>
<p>Câu hỏi tưởng đơn giản: <em>ai commit Ingress?</em> App team vì họ biết host và path. Platform team vì họ biết class, certificate, rate limit, WAF. Cả hai đều đúng — và đó là lý do file này hay thành chỗ rò rỉ trách nhiệm.</p>
<h2 id="khong-phai-file-ma-la-hop-dong">Không phải file, mà là hợp đồng</h2>
<p>Ingress không phải “cấu hình web”. Nó là hợp đồng công khai của dịch vụ: DNS, TLS, routing, đôi khi cả authentication annotation. Khi hợp đồng nằm trong repo ứng dụng, mỗi pull request của feature có thể đổi bề mặt internet. Khi hợp đồng nằm trong repo platform, app team phải mở ticket để thêm path <code>/v2</code>.</p>
<p>Cả hai cực đều đắt. Cực app-owns-all biến cluster thành cái đinh đóng nhiều bảng hiệu. Cực platform-owns-all biến platform thành bộ phận helpdesk.</p>
<blockquote><p>Hãy tách <strong>intent</strong> khỏi <strong>mechanism</strong>. App mô tả họ cần gì. Platform quyết định làm thế nào.</p></blockquote>
<h2 id="mau-tach-hop-dong">Mẫu tách hợp đồng</h2>
<p>Mẫu tôi dùng khi review:</p>
<ul>
<li><strong>App repo</strong> khai báo service name, port, host mong muốn, path, timeout.</li>
<li><strong>Platform repo</strong> giữ IngressClass, certificate issuer, default annotations, WAF policy, IP allowlist.</li>
<li>Một controller hoặc Kustomize overlay ghép hai phần lúc sync.</li>
</ul>
<p>HTTPRoute của Gateway API giúp hơn Ingress cổ điển: app team có thể sở hữu route object, cluster operator sở hữu Gateway. Đó không phải slogan — đó là RBAC có ý nghĩa.</p>
<pre><code>apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: notes
spec:
  parentRefs:
    - name: public-gateway
  hostnames:
    - "datngo.dev"
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /writing
      backendRefs:
        - name: web
          port: 8080</code></pre>
<h3 id="annotation-la-noi-vo-ky-luat">Annotation là nơi vô kỷ luật</h3>
<p>nginx.ingress.kubernetes.io/rewrite-target, proxy-body-size, force-ssl-redirect — mỗi annotation là một quyết định bảo mật hoặc hiệu năng. Nếu app team có quyền ghi tự do, review GitOps trở thành đọc thơ. Nếu platform cấm hết, app team fork chart.</p>
<p>Đặt allowlist. Một file policy trong repo platform liệt kê annotation được phép. CI fail khi app thêm key lạ. Rẻ hơn việc viết wiki.</p>
<h2 id="ai-review-ai-oncall">Ai review, ai on-call</h2>
<p>Ownership thật sự lộ ra lúc 2 giờ sáng. TLS hết hạn là platform. Path 404 sau khi app đổi prefix là app. WAF chặn webhook là hai bên phải cùng đọc log.</p>
<p>Ghi rõ trong CODEOWNERS:</p>
<ul>
<li><code>/deploy/ingress/</code> — platform</li>
<li><code>/deploy/routes/</code> — app, với CODEOWNERS phụ của platform trên file <code>*.policy.yaml</code></li>
</ul>
<p>Đừng dùng “cả team đều approve”. Đó là cách để không ai đọc.</p>
<h2 id="viec-nen-lam-tuan-nay">Việc nên làm tuần này</h2>
<ol>
<li>Liệt kê mọi Ingress đang live, ghi owner hiện tại — đừng đoán, đọc annotation và git blame.</li>
<li>Tách class, issuer, WAF ra khỏi repo app nếu chúng đang nằm đó.</li>
<li>Thêm policy allowlist cho annotation, fail CI khi lệch.</li>
<li>Viết một trang “ai gọi ai lúc TLS fail” — ngắn hơn một trang Notion.</li>
</ol>
<p>GitOps không phải là “mọi thứ trong Git”. GitOps là mọi thay đổi có người chịu. Ingress là bài test rẻ nhất để biết team đã làm được điều đó chưa.</p>
<p>Xem thêm <a href="/writing/doc-cve-nhu-ky-su">cách đọc CVE như kỹ sư</a> — cùng một thói quen: hỏi bề mặt nào vừa đổi, ai sở hữu nó.</p>`,
  },
  {
    id: "post-cve",
    slug: "doc-cve-nhu-ky-su",
    title: "Đọc CVE như một kỹ sư, không như một feed",
    excerpt:
      "Headline không phải tín hiệu. Hãy hỏi: binary nào, mạng nào, quyền nào, và patch có thật sự đóng được primitive không.",
    coverUrl: seedMedia[2].url,
    coverAlt: seedMedia[2].alt,
    featured: true,
    publishedAt: "2026-08-21T04:00:00.000Z",
    focusKeyword: "cve",
    tagIds: ["tag-security"],
    html: `<p>Feed CVE là một cái loa. Nếu đọc như tin tức, bạn sẽ luôn thấy khẩn cấp và luôn vá trễ. Kỹ sư đọc khác: họ tìm primitive, không tìm điểm CVSS.</p>
<p>CVSS 9.8 trên một daemon không chạy trong cluster của bạn rẻ hơn CVSS 7.1 trên reverse proxy đang terminate TLS cho toàn bộ traffic.</p>
<h2 id="bon-cau-hoi">Bốn câu hỏi trước khi mở ticket</h2>
<ol>
<li>Thành phần đó có mặt trên bề mặt internet, hay chỉ trong VPC?</li>
<li>Khai thác cần auth, cần user interaction, hay pre-auth?</li>
<li>Primitive là RCE, auth bypass, hay chỉ leak version?</li>
<li>Patch có đổi hành vi client không — hay chỉ đóng parser?</li>
</ol>
<p>Nếu không trả lời được câu 1, đừng assign severity. Hãy inventory.</p>
<figure>
<img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=80" alt="Bàn tay kỹ sư trên bàn phím trước màn hình log bảo mật" />
<figcaption>Advisory hay. Inventory tốt hơn.</figcaption>
</figure>
<h2 id="bo-loc-thuc-chien">Bộ lọc thực chiến</h2>
<p>Tôi giữ một bảng nhỏ, không dashboard:</p>
<ul>
<li><strong>Ignore</strong> — không có binary, không có image, không có managed service.</li>
<li><strong>Watch</strong> — có mặt nhưng không expose, chờ patch vendor.</li>
<li><strong>Patch now</strong> — pre-auth hoặc đang expose, có PoC công khai.</li>
<li><strong>Compensate</strong> — chưa có patch, WAF / network policy / disable feature.</li>
</ul>
<blockquote><p>Đừng vá vì sợ. Vá vì primitive khớp với bề mặt bạn đang mở.</p></blockquote>
<h3 id="poc-cong-khai">PoC công khai đổi ưu tiên</h3>
<p>Advisory im lặng và PoC trên GitHub là hai thế giới. Khi PoC xuất hiện, Watch có thể thành Patch now trong vài giờ. Đặt alert cho repo advisory và cho từ khóa CVE trên nguồn bạn tin — không phải mọi account security trên mạng xã hội.</p>
<h2 id="viet-lai-advisory">Viết lại advisory cho team</h2>
<p>Một ticket tốt có bốn dòng:</p>
<pre><code>Component: ingress-nginx 1.11.x
Primitive: NGINX annotation injection → RCE
Exposure: internet-facing, several clusters
Action: upgrade chart, deny-list annotations, rollout by Friday</code></pre>
<p>Không dán nguyên CVE. Đồng nghiệp không đọc. Họ cần biết làm gì trước standup.</p>
<p>Cùng logic với <a href="/writing/gitops-ai-so-huu-ingress">ai sở hữu Ingress</a>: chỗ bạn không rõ owner là chỗ advisory sẽ nằm chờ.</p>
<h2 id="thoi-quen-15-phut">Thói quen 15 phút</h2>
<p>Mỗi sáng, không hơn:</p>
<ol>
<li>NVD / CISA KEV — chỉ mục KEV, không lướt hết NVD.</li>
<li>Vendor bạn thực sự chạy: Kubernetes, cloud, IdP, mail gateway.</li>
<li>Một dòng trong log cá nhân: ignore / watch / patch. Không để trong đầu.</li>
</ol>
<p>Bảo mật cá nhân của người viết kỹ thuật không phải biết hết CVE. Đó là biết hệ thống của mình đang mở những cửa nào.</p>`,
  },
  {
    id: "post-writing",
    slug: "viet-ky-thuat-nhu-thiet-ke-he-thong",
    title: "Viết kỹ thuật như thiết kế hệ thống",
    excerpt:
      "Bài viết cũng có API: tiêu đề là function name, H2 là surface, ví dụ là test. Người đọc là caller, không phải khán giả.",
    coverUrl: seedMedia[1].url,
    coverAlt: seedMedia[1].alt,
    featured: false,
    publishedAt: "2026-07-30T03:00:00.000Z",
    focusKeyword: "viet ky thuat",
    tagIds: ["tag-writing"],
    html: `<p>Kỹ sư viết kém không phải vì thiếu chữ. Họ viết như đang giải thích cho chính mình lúc 1 giờ sáng — đầy ngữ cảnh, thiếu hợp đồng.</p>
<p>Hãy đảo: người đọc không ở trong đầu bạn. Họ gọi bài viết như gọi một API. Nếu signature xấu, họ không debug. Họ đóng tab.</p>
<h2 id="signature">Signature</h2>
<p>Tiêu đề phải nói được primitive. “Vài suy nghĩ về Kubernetes” không phải signature. “GitOps: ai sở hữu Ingress?” mới là. Người đọc biết họ sẽ nhận owner model, không phải tour tool.</p>
<p>Đoạn mở 120 từ: nêu căng thẳng, nêu vì sao đắt, nêu việc sẽ làm. Không hook giả, không câu chuyện tuổi thơ.</p>
<h2 id="surface">Surface — các H2</h2>
<p>H2 là public method. Nếu một H2 không trả lời được câu hỏi “người đọc làm gì với phần này?”, hãy xóa. H3 chỉ để phân nhánh, không phải để làm mục lục đẹp.</p>
<ul>
<li>Một luận điểm / H2.</li>
<li>Một ví dụ cụ thể — file, lệnh, ticket — không ví dụ “giả sử startup X”.</li>
<li>Một phản ví dụ: khi nào lời khuyên này sai.</li>
</ul>
<blockquote><p>Mục lục không phải trang trí. Đó là type definition của bài.</p></blockquote>
<h2 id="test">Ví dụ là test</h2>
<p>Đoạn code trong bài phải chạy được trong đầu. Nếu bạn cắt bớt cho gọn mà người đọc không đoán được context, đó là test fail. Hãy giữ enough to compile.</p>
<pre><code>// Bad: "cấu hình tương tự như trên"
// Good:
create index if not exists posts_status_published_idx
  on posts (status, published_at desc);</code></pre>
<h3 id="giong-van">Giọng văn</h3>
<p>Giọng kỹ thuật tốt là giọng review PR: trực tiếp, không đùa trong phần nguy hiểm, không giảm nhẹ rủi ro. Một câu ngắn sau đoạn dài. Tiếng Việt được. Jargon giữ nguyên nếu đó là tên thật của thứ — Ingress, CVSS, HTTPRoute.</p>
<h2 id="xuat-ban">Xuất bản là deploy</h2>
<p>Draft là staging. Published là production. SEO là health check, không phải mục tiêu. Nếu slug đổi sau khi index, bạn đang rename public API.</p>
<p>Tôi giữ một checklist trước khi bấm xuất bản — cùng tinh thần với panel SEO trong studio:</p>
<ol>
<li>Người lạ đọc H2 có hiểu luận điểm không?</li>
<li>Có một việc nên làm trong 30 phút?</li>
<li>Ảnh có alt, link có chỗ đến, keyword có trong đoạn mở?</li>
</ol>
<p>Viết nhiều không bằng viết có surface ổn định. Đó là lý do DATNGO có mục lục, không có infinite scroll.</p>`,
  },
  {
    id: "post-cms",
    slug: "cms-cho-nguoi-viet-ky-thuat",
    title: "CMS cho người viết kỹ thuật: Ghost, WordPress, và thứ thực sự quan trọng",
    excerpt:
      "Đừng chọn CMS bằng marketplace theme. Chọn bằng editor, media, và chỗ bạn đo bài trước khi bấm xuất bản.",
    coverUrl: seedMedia[3].url,
    coverAlt: seedMedia[3].alt,
    featured: false,
    publishedAt: "2026-08-28T05:00:00.000Z",
    focusKeyword: "cms",
    tagIds: ["tag-cms", "tag-writing"],
    html: `<p>WordPress thắng vì hệ sinh thái. Ghost thắng vì editor và newsletter. Người viết kỹ thuật thường cần một thứ cả hai làm nửa vời: chỗ soạn thảo không làm mất mạch, chỗ gắn ảnh từ URL, chỗ nói bài này còn yếu trước khi index.</p>
<h2 id="editor-la-san-pham">Editor mới là sản phẩm</h2>
<p>Gutenberg mạnh nhưng ồn. Ghost Koenig êm nhưng dễ thiếu block kỹ thuật (bảng, caption, callout). TipTap-class editor — title lớn, body sạch, slash để chèn, bubble khi bôi — là điểm ngọt nếu bạn tự host.</p>
<p>Yêu cầu tối thiểu của tôi:</p>
<ul>
<li>Gõ không giật, autosave, Cmd+S.</li>
<li>Ảnh từ URL, không bắt upload local — CDN và Unsplash sống khỏe.</li>
<li>Heading có id, mục lục sinh từ H2/H3.</li>
<li>SEO score ngay cạnh bài, không phải plugin tầng hai.</li>
</ul>
<figure>
<img src="https://images.unsplash.com/photo-1499750310107-5fefc47bd675?auto=format&fit=crop&w=1400&q=80" alt="Laptop trên bàn gỗ cạnh sổ tay, ánh sáng cửa sổ" />
<figcaption>Chỗ viết phải biến mất. Thanh công cụ chỉ hiện khi cần.</figcaption>
</figure>
<h2 id="media-khong-phai-dia">Media không phải đĩa</h2>
<p>Lưu file trên máy chủ ứng dụng là thói quen WordPress năm 2012. Với Vercel, filesystem là ảo. Nguồn sự thật của ảnh nên là URL: Cloudinary, R2, Unsplash, hoặc blog gốc.</p>
<p>Thư viện media lúc này là catalog: URL, alt, credit, caption. Insert là chèn thẻ <code>img</code>, không phải copy blob.</p>
<h2 id="seo-va-ai">SEO và AI — đo, đừng thờ</h2>
<p>SEO checklist cổ điển vẫn hữu ích: title 50–60, description 145–160, một H1, ảnh có alt, nội dung đủ dài. Đó là lint.</p>
<p>AI review thì khác: nó bắt mạch, giọng, chỗ lập luận đứt. Hãy gọi khi bài gần xong, không phải mỗi keystroke — vừa tốn, vừa biến model thành editor-in-chief.</p>
<blockquote><p>Lint thì tự động. Phán xét thì do bạn bấm nút.</p></blockquote>
<h2 id="newsletter">Newsletter không phải popup</h2>
<p>Beehiiv (hoặc Ghost native) thắng khi bạn coi email là kênh xuất bản, không phải form thu thập. Một route <code>/newsletter</code>, một embed, một danh sách local để bạn còn chủ dữ liệu nếu đổi vendor.</p>
<p>Đừng chặn đọc bằng wall. Kỹ sư đóng tab. Hãy để bài đọc xong rồi mời — giống footnote, không giống billboard.</p>
<h2 id="tu-host-khi-nao">Tự host khi nào</h2>
<p>Tự viết CMS có lý khi editor là sản phẩm, khi bạn muốn SEO/AI dính vào bài, khi deploy Vercel và không muốn PHP. Không có lý khi bạn cần 40 plugin thương mại và WooCommerce.</p>
<p>DATNGO là câu trả lời cho trường hợp thứ nhất: một studio viết, một thư viện URL, một panel SEO, một lần gọi Grok khi bạn sẵn sàng bị chê.</p>
<p>Nếu bạn đang phân vân ownership như với Ingress — <a href="/writing/gitops-ai-so-huu-ingress">đọc bài đó trước</a>. Công cụ xuất bản cũng cần owner.</p>`,
  },
];

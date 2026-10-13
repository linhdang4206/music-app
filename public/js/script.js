const aplayer = document.querySelector("#aplayer");
if (aplayer) {
    const dataSong = JSON.parse(aplayer.getAttribute("data-song") || "{}") || {};
    const dataSinger = JSON.parse(aplayer.getAttribute("data-singer") || "{}") || {};

    const ap = new APlayer({
        container: aplayer,
        audio: [{
            name: dataSong.title || "Bài hát",
            artist: dataSinger.fullName || "Unknown",
            url: dataSong.audio || "",
            cover: dataSong.avatar || "",
        }],
        autoplay: false,
        volume: 0.7,
    });

    const avatar = document.querySelector(".singer-detail .inner-avatar");

    ap.on('play', function () {
        if (avatar) avatar.style.animationPlayState = "running";
    });

    ap.on('pause', function () {
        if (avatar) avatar.style.animationPlayState = "paused";
    });
}

const buttonLike = document.querySelector("[data-like]");
if (buttonLike) {
    buttonLike.addEventListener("click", () => {
        const idSong = buttonLike.getAttribute("data-like");
        const isActive = buttonLike.classList.contains("active");
        const typeLike = isActive ? "dislike" : "like";
        const link = `/songs/like/${typeLike}/${idSong}`;

        fetch(link, { method: "PATCH" })
            .then(res => res.json())
            .then(data => {
                if (data.code == 200) {
                    const span = buttonLike.querySelector("span");
                    if (span) span.innerHTML = `${data.like} thích`;
                    buttonLike.classList.toggle("active");
                }
            });
    });
}

const favoriteButtons = document.querySelectorAll("[data-favorite]");
favoriteButtons.forEach((buttonFavorite) => {
    buttonFavorite.addEventListener("click", () => {
        const idSong = buttonFavorite.getAttribute("data-favorite");
        const isActive = buttonFavorite.classList.contains("active");
        const typeFavorite = isActive ? "unfavorite" : "favorite";
        const link = `/songs/favorite/${typeFavorite}/${idSong}`;

        fetch(link, { method: "PATCH" })
            .then(res => {
                if (!res.ok) throw new Error(`Favorite request failed: ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (data.code == 200) {
                    buttonFavorite.classList.toggle("active");
                    buttonFavorite.setAttribute("aria-pressed", String(!isActive));
                    buttonFavorite.setAttribute(
                        "aria-label",
                        isActive ? "Thêm vào yêu thích" : "Bỏ khỏi yêu thích"
                    );
                    const icon = buttonFavorite.querySelector("i");
                    if (icon) {
                        icon.classList.toggle("fa-regular", isActive);
                        icon.classList.toggle("fa-solid", !isActive);
                    }
                }
            })
            .catch(error => console.error("Không thể cập nhật bài hát yêu thích:", error));
    });
});

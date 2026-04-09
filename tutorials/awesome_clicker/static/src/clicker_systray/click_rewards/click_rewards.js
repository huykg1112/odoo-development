import {choose} from "../../utils/utils"; // Hàm choose được import từ utils.js, giúp chọn ngẫu nhiên một phần tử từ một mảng, được sử dụng trong phần thưởng click để tạo ra các phần thưởng ngẫu nhiên khác nhau mỗi khi người dùng click vào item trong systray.

export const rewards = [
    {
        description: "🎁 Get 100 free clicks!",
        apply(clicker) {
            clicker.increment(100);
        },
        maxLevel: 2,
    },
    {
        description: "🤖 Get 1 free ClickBot!",
        apply(clicker) {
            clicker.clickBots += 1;
        },
        minLevel: 1,
        maxLevel: 3,
    },
    {
        description: "🤖🤖 Get 5 free ClickBots!",
        apply(clicker) {
            clicker.clickBots += 5;
        },
        minLevel: 2,
    },
    {
        description: "🦾 Get 1 free BigBot!",
        apply(clicker) {
            clicker.bigBots += 1;
        },
        minLevel: 2,
    },
    {
        description: "⚡ Power up! Multiplier +1",
        apply(clicker) {
            clicker.power += 1;
        },
        minLevel: 3,
    },
    {
        description: "💰 Jackpot! Get 10,000 clicks!",
        apply(clicker) {
            clicker.increment(10000);
        },
        minLevel: 2,
    },
]

export function getReward(level) {

    const eligible = rewards.filter((r) => { // tìm 
        if (r.minLevel !== undefined && level < r.minLevel) return false; // nếu phần thưởng có minLevel và level hiện tại của người chơi thấp hơn minLevel đó, thì phần thưởng này không đủ điều kiện để được chọn, nên trả về false để loại bỏ nó khỏi danh sách eligible.
        if (r.maxLevel !== undefined && level >= r.maxLevel) return false; // nếu phần thưởng có maxLevel và level hiện tại của người chơi lớn hơn hoặc bằng maxLevel đó, thì phần thưởng này cũng không đủ điều kiện để được chọn, nên trả về false để loại bỏ nó khỏi danh sách eligible.
        return true;
    });
    return choose(eligible);
}
/** @odoo/model **/

import { EventBus } from "@odoo/owl"; // EventBus là một lớp cung cấp cơ chế phát và lắng nghe sự kiện trong OWL, cho phép các component giao tiếp với nhau thông qua việc phát ra các sự kiện tùy chỉnh và đăng ký lắng nghe chúng, giúp tạo ra một hệ thống tương tác linh hoạt và dễ quản lý giữa các phần của ứng dụng mà không cần phải truyền props qua nhiều cấp độ component
import { Reactive } from "@web/core/utils/reactive"; // Reactive là một lớp cơ sở trong OWL được sử dụng để tạo ra các đối tượng có khả năng phản ứng (reactive), cho phép tự động cập nhật giao diện người dùng khi dữ liệu thay đổi, giúp quản lý trạng thái của ứng dụng một cách hiệu quả và dễ dàng hơn. Khi một đối tượng kế thừa từ Reactive, nó sẽ tự động theo dõi các thuộc tính của mình và thông báo cho các component liên quan khi có sự thay đổi, giúp đảm bảo rằng giao diện luôn đồng bộ với dữ liệu hiện tại.
import { getReward } from "./click_rewards/click_rewards";

export class ClickerModel extends Reactive {

    bus = new EventBus(); // Tạo một instance của EventBus để quản lý các sự kiện tùy chỉnh trong ứng dụng clicker, giúp các component có thể giao tiếp với nhau thông qua việc phát ra và lắng nghe các sự kiện này một cách linh hoạt và hiệu quả hơn trong OWL.
    count =0;
    level = 0;
    clickBots= 0;
    bigBots = 0;
    power = 1;

    // Thêm thuộc tính state
    trees = {
        pear: 0,
        cherry: 0,
    };
    fruits = {
        pear: 0,
        cherry: 0,
    };



    constructor() { // Hàm khởi tạo của class ClickerModel, được gọi khi một instance mới của ClickerModel được tạo ra. Trong hàm này, chúng ta gọi super() để đảm bảo rằng các thuộc tính và phương thức của lớp cha Reactive được khởi tạo đúng cách, giúp ClickerModel có khả năng phản ứng (reactive) và có thể sử dụng các tính năng của Reactive một cách hiệu quả trong OWL.
        super();
        setInterval(()=> this.tick(),1000); // Sử dụng setInterval để tạo một timer chạy mỗi giây, giúp tự động tăng số lượng click dựa trên số lượng click bot mà người chơi đã mua, tạo ra một cơ chế tích lũy click thụ động trong trò chơi.
        setInterval(() => this.tick(), 10000);
        setInterval(() => this.fruitTick(), 30000);
    }

    onclick(amount) {
        this.count += amount; // Phải là 'count' chứ không phải 'clicks'
        this.checkLevelUp();
    }

    buyClickBot() {
        if (this.count >= 1000) {
            this.count -= 1000;
            this.clickBots += 1;
        }
    }

    buyBigBot() {
        if (this.count >= 5000) {
            this.count -= 5000;
            this.bigBots += 1;
        }
    }

    buyPower() {
        if (this.count >= 50000) {
            this.count -= 50000;
            this.power += 1;
        }
    }

    buyTree(type) {
        if (this.count >= 100000) {
            this.count -= 100000;
            this.trees[type] += 1;
        }
    }


    tick() {
        const botClicks = (10 * this.clickBots + 100 * this.bigBots) * this.power;
        if (botClicks > 0) {
            this.count += botClicks;
            this.checkLevelUp();
        }
    }

    fruitTick() {
    for (const type of ["pear", "cherry"]) {
        this.fruits[type] += this.trees[type];
    }
}

    checkLevelUp() {
        if (this.count >= 1000 && this.level < 1) {
            this.level = 1;
            this.bus.trigger("MILESTONE_1k"); // Phát ra sự kiện "MILESTONE_1k" khi người chơi đạt được 1000 click, giúp các component khác có thể lắng nghe và phản ứng lại sự kiện này, ví dụ như mở một dialog chúc mừng hoặc cập nhật giao diện để thông báo cho người chơi về cột mốc quan trọng này trong trò chơi clicker.
        }
        if (this.count >= 5000 && this.level < 2) {
            this.level = 2;
            this.bus.trigger("MILESTONE_5k", { level: 2 });
        }
        if (this.count >= 50000 && this.level < 3) {
            this.level = 3;
            this.bus.trigger("MILESTONE_50k", { level: 3 });
        }
        if (this.count >= 100000 && this.level < 4) {
            this.level = 4;
            this.bus.trigger("MILESTONE_100k", { level: 4 });
        }
    }

    claimReward() {
        const reward = getReward(this.level);
        if (reward) {
            reward.apply(this);
            return reward;
        }
    }

    get totalTrees() {
        return this.trees.pear + this.trees.cherry;
    }

    get totalFruits() {
        return this.fruits.pear + this.fruits.cherry;
    }

    

}
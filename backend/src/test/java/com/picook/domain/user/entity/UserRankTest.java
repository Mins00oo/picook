package com.picook.domain.user.entity;

import com.picook.domain.user.dto.RankInfo;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserRankTest {

    @Test
    void 카운트_0이면_레벨1() {
        UserRank rank = UserRank.fromCount(0);
        assertThat(rank).isEqualTo(UserRank.LV1);
        assertThat(rank.getLevel()).isEqualTo(1);
        assertThat(rank.getTitle()).isEqualTo("병아리");
    }

    @Test
    void 카운트_2이면_레벨1() {
        UserRank rank = UserRank.fromCount(2);
        assertThat(rank).isEqualTo(UserRank.LV1);
    }

    @Test
    void 카운트_3이면_레벨2() {
        UserRank rank = UserRank.fromCount(3);
        assertThat(rank).isEqualTo(UserRank.LV2);
        assertThat(rank.getTitle()).isEqualTo("초보 요리사");
    }

    @Test
    void 카운트_6이면_레벨3() {
        UserRank rank = UserRank.fromCount(6);
        assertThat(rank).isEqualTo(UserRank.LV3);
    }

    @Test
    void 카운트_11이면_레벨4() {
        UserRank rank = UserRank.fromCount(11);
        assertThat(rank).isEqualTo(UserRank.LV4);
    }

    @Test
    void 카운트_21이면_레벨5() {
        UserRank rank = UserRank.fromCount(21);
        assertThat(rank).isEqualTo(UserRank.LV5);
    }

    @Test
    void 카운트_36이면_레벨6() {
        UserRank rank = UserRank.fromCount(36);
        assertThat(rank).isEqualTo(UserRank.LV6);
    }

    @Test
    void 카운트_51이면_레벨7() {
        UserRank rank = UserRank.fromCount(51);
        assertThat(rank).isEqualTo(UserRank.LV7);
        assertThat(rank.getTitle()).isEqualTo("전설의 셰프");
    }

    @Test
    void 카운트_100이면_레벨7() {
        UserRank rank = UserRank.fromCount(100);
        assertThat(rank).isEqualTo(UserRank.LV7);
    }

    @Test
    void nextLevelAt_레벨1이면_3() {
        UserRank rank = UserRank.fromCount(0);
        assertThat(rank.getNextLevelAt(0)).isEqualTo(3);
    }

    @Test
    void nextLevelAt_레벨7이면_null() {
        UserRank rank = UserRank.fromCount(51);
        assertThat(rank.getNextLevelAt(51)).isNull();
    }

    @Test
    void RankInfo_of_정상_생성() {
        RankInfo info = RankInfo.of(5);
        assertThat(info.level()).isEqualTo(2);
        assertThat(info.title()).isEqualTo("초보 요리사");
        assertThat(info.nextLevelAt()).isEqualTo(6);
    }
}

package com.picook.domain.user.entity;

import com.picook.domain.user.dto.RankInfo;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserRankTest {

    // v1.0 EXP 기반 임계치: Lv1=0, Lv2=240, Lv3=480, Lv4=880, Lv5=1680, Lv6=2880, Lv7=4080

    @Test
    void EXP_0이면_레벨1() {
        UserRank rank = UserRank.fromExp(0L);
        assertThat(rank).isEqualTo(UserRank.LV1);
        assertThat(rank.getLevel()).isEqualTo(1);
        assertThat(rank.getTitle()).isEqualTo("병아리");
    }

    @Test
    void EXP_239이면_레벨1() {
        assertThat(UserRank.fromExp(239L)).isEqualTo(UserRank.LV1);
    }

    @Test
    void EXP_240이면_레벨2() {
        UserRank rank = UserRank.fromExp(240L);
        assertThat(rank).isEqualTo(UserRank.LV2);
        assertThat(rank.getTitle()).isEqualTo("초보 요리사");
    }

    @Test
    void EXP_480이면_레벨3() {
        assertThat(UserRank.fromExp(480L)).isEqualTo(UserRank.LV3);
    }

    @Test
    void EXP_880이면_레벨4() {
        assertThat(UserRank.fromExp(880L)).isEqualTo(UserRank.LV4);
    }

    @Test
    void EXP_1680이면_레벨5() {
        assertThat(UserRank.fromExp(1680L)).isEqualTo(UserRank.LV5);
    }

    @Test
    void EXP_2880이면_레벨6() {
        assertThat(UserRank.fromExp(2880L)).isEqualTo(UserRank.LV6);
    }

    @Test
    void EXP_4080이면_레벨7() {
        UserRank rank = UserRank.fromExp(4080L);
        assertThat(rank).isEqualTo(UserRank.LV7);
        assertThat(rank.getTitle()).isEqualTo("전설의 셰프");
    }

    @Test
    void EXP_초과_누적이어도_레벨7() {
        assertThat(UserRank.fromExp(9999L)).isEqualTo(UserRank.LV7);
    }

    @Test
    void nextLevelAt_레벨1이면_240() {
        assertThat(UserRank.fromExp(0L).getNextLevelAt()).isEqualTo(240L);
    }

    @Test
    void nextLevelAt_레벨7이면_null() {
        assertThat(UserRank.fromExp(4080L).getNextLevelAt()).isNull();
    }

    @Test
    void RankInfo_of_정상_생성() {
        RankInfo info = RankInfo.of(300L);
        assertThat(info.level()).isEqualTo(2);
        assertThat(info.title()).isEqualTo("초보 요리사");
        assertThat(info.nextLevelAt()).isEqualTo(480L);
        assertThat(info.currentExp()).isEqualTo(300L);
    }
}

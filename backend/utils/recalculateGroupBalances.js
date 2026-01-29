export const recalculateGroupBalances = (group) => {
    // reset
    group.members.forEach(m => {
        m.spent = 0;
        m.owed = 0;
        m.lent = 0;
    });

    group.feasts.forEach(feast => {
        feast.feastFriends.forEach(ff => {
            const member = group.members.find(m => m.userId === ff.userId);
            if (!member) return;

            if (ff.balanceAmount > 0) {
                member.lent += ff.balanceAmount;
                member.spent += ff.balanceAmount;
            } else {
                member.owed += Math.abs(ff.balanceAmount);
            }
        });
    });

    return group;
};

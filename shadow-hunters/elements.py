import card
import deck
import character
import area
import single_use
import hermit
import win_conditions
import specials

from constants import Alleg, CardType

# elements.py
# Encodes all characters, win conditions, special abilities,
# game areas, decks, and cards in an element factory. Every
# game context is initialized with its own element factory.


class ElementFactory:
    """Make all elements needed for the game."""

    def __init__(self):

        # Initialize white cards
        white_cards = [
            card.Card(
                title="Mystic Compass",
                desc=("當你移動時，你可以擲骰兩次"
                      "並選擇要使用哪個結果。"),
                color=CardType.White,
                holder=None,
                is_equip=True,
                use=None
            ),
            card.Card(
                title="Talisman",
                desc=("你不會受到黑牌'嗜血蜘蛛'、'吸血蝙蝠'"
                      "或'炸藥'的傷害。"),
                color=CardType.White,
                holder=None,
                is_equip=True,
                use=None
            ),
            card.Card(
                title="Fortune Brooch",
                desc=(
                    "你不會受到區域卡'詭異森林'的傷害。"
                    "你仍然可以被它治癒。"),
                color=CardType.White,
                holder=None,
                is_equip=True,
                use=None
            ),
            card.Card(
                title="Silver Rosary",
                desc=("如果你殺死另一個角色，"
                      "你獲得他們所有的裝備卡。"),
                color=CardType.White,
                holder=None,
                is_equip=True,
                use=None
            ),
            card.Card(
                title="Spear of Longinus",
                desc=("如果你是已揭露身分的獵人且你的攻擊成功，"
                      "你造成額外2點傷害。"),
                color=CardType.White,
                holder=None,
                is_equip=True,
                use=None
            ),
            card.Card(
                title="Advent",
                desc=("如果你是獵人，你可以揭露你的身分。"
                      "如果你這麼做，或如果你已經揭露身分，"
                      "你完全恢復生命值。"),
                color=CardType.White,
                holder=None,
                is_equip=False,
                use=single_use.advent
            ),
            card.Card(
                title="Disenchant Mirror",
                desc=("如果你是暗影陣營（除了未知者），"
                      "你必須揭露你的身分。"),
                color=CardType.White,
                holder=None,
                is_equip=False,
                use=single_use.disenchant_mirror
            ),
            card.Card(
                title="Blessing",
                desc=("選擇一個除了你以外的角色並擲六面骰。"
                      "該角色恢復等同於骰子點數的生命值。"),
                color=CardType.White,
                holder=None,
                is_equip=False,
                use=single_use.blessing
            ),
            card.Card(
                title="Chocolate",
                desc=("如果你是Allie、Agnes、Emi、Ellen、Unknown"
                      "或Ultra Soul，你可以揭露你的身分。"
                      "如果你這麼做，或如果你已經揭露身分，"
                      "你完全恢復生命值。"),
                color=CardType.White,
                holder=None,
                is_equip=False,
                use=single_use.chocolate
            ),
            card.Card(
                title="Concealed Knowledge",
                desc="當這個回合結束時，將會是你的回合。",
                color=CardType.White,
                holder=None,
                is_equip=False,
                use=single_use.concealed_knowledge
            ),
            card.Card(
                title="Guardian Angel",
                desc=("直到你的下個回合開始前，"
                      "你不會受到其他角色的直接攻擊傷害。"),
                color=CardType.White,
                holder=None,
                is_equip=False,
                use=single_use.guardian_angel
            ),
            card.Card(
                title="Holy Robe",
                desc=("你的攻擊少造成1點傷害，且你受到的"
                      "攻擊傷害減少1點。"),
                color=CardType.White,
                holder=None,
                is_equip=True,
                use=lambda is_attack, successful, amt: max(
                    0, amt - 1)  # applies to both attack and defend
            ),
            card.Card(
                title="Flare of Judgement",
                desc=("除了你以外的所有角色"
                      "受到2點傷害。"),
                color=CardType.White,
                holder=None,
                is_equip=False,
                use=single_use.judgement
            ),
            card.Card(
                title="First Aid",
                desc=("將一個角色的傷害標記設為7"
                      "（你可以選擇自己）。"),
                color=CardType.White,
                holder=None,
                is_equip=False,
                use=single_use.first_aid
            ),
            card.Card(
                title="Holy Water of Healing",
                desc="治療你2點傷害。",
                color=CardType.White,
                holder=None,
                is_equip=False,
                use=single_use.holy_water
            ),
            card.Card(
                title="Holy Water of Healing",
                desc="治療你2點傷害。",
                color=CardType.White,
                holder=None,
                is_equip=False,
                use=single_use.holy_water
            )
        ]

        # Initialize black cards
        black_cards = [
            card.Card(
                title="Cursed Sword Masamune",
                desc=(
                    "你必須在你的回合攻擊另一個角色。"
                    "這次攻擊使用四面骰。"),
                color=CardType.Black,
                holder=None,
                is_equip=True,
                use=None
            ),
            card.Card(
                title="Machine Gun",
                desc=(
                    "你的攻擊會影響到攻擊範圍內的所有角色"
                    "（骰子只擲一次）。"),
                color=CardType.Black,
                holder=None,
                is_equip=True,
                use=None
            ),
            card.Card(
                title="Handgun",
                desc="除了你的位置外，所有位置都變成你的攻擊範圍。",
                color=CardType.Black,
                holder=None,
                is_equip=True,
                use=None
            ),
            card.Card(
                title="Butcher Knife",
                desc=("如果你的攻擊成功，"
                      "你造成額外1點傷害。"),
                color=CardType.Black,
                holder=None,
                is_equip=True,
                use=lambda is_attack, successful, amt: amt +
                1 if (is_attack and successful) else amt
            ),
            card.Card(
                title="Chainsaw",
                desc=("如果你的攻擊成功，"
                      "你造成額外1點傷害。"),
                color=CardType.Black,
                holder=None,
                is_equip=True,
                use=lambda is_attack, successful, amt: amt +
                1 if (is_attack and successful) else amt
            ),
            card.Card(
                title="Rusted Broad Axe",
                desc=("如果你的攻擊成功，"
                      "你造成額外1點傷害。"),
                color=CardType.Black,
                holder=None,
                is_equip=True,
                use=lambda is_attack, successful, amt: amt +
                1 if (is_attack and successful) else amt
            ),
            card.Card(
                title="Moody Goblin",
                desc="你偷取任意角色的一張裝備卡。",
                color=CardType.Black,
                holder=None,
                is_equip=False,
                use=single_use.moody_goblin
            ),
            card.Card(
                title="Moody Goblin",
                desc="你偷取任意角色的一張裝備卡。",
                color=CardType.Black,
                holder=None,
                is_equip=False,
                use=single_use.moody_goblin
            ),
            card.Card(
                title="Bloodthirsty Spider",
                desc=("你對任意角色造成2點傷害，"
                      "並且自己也受到2點傷害。"),
                color=CardType.Black,
                holder=None,
                is_equip=False,
                use=single_use.bloodthirsty_spider
            ),
            card.Card(
                title="Vampire Bat",
                desc=("你對任意角色造成2點傷害，"
                      "並治療自己1點傷害。"),
                color=CardType.Black,
                holder=None,
                is_equip=False,
                use=single_use.vampire_bat
            ),
            card.Card(
                title="Vampire Bat",
                desc=("你對任意角色造成2點傷害，"
                      "並治療自己1點傷害。"),
                color=CardType.Black,
                holder=None,
                is_equip=False,
                use=single_use.vampire_bat
            ),
            card.Card(
                title="Vampire Bat",
                desc=("你對任意角色造成2點傷害，"
                      "並治療自己1點傷害。"),
                color=CardType.Black,
                holder=None,
                is_equip=False,
                use=single_use.vampire_bat
            ),
            card.Card(
                title="Diabolic Ritual",
                desc=("如果你是暗影陣營，你可以揭露你的身分。"
                      "如果你這麼做，你完全恢復生命值。"),
                color=CardType.Black,
                holder=None,
                is_equip=False,
                use=single_use.diabolic_ritual
            ),
            card.Card(
                title="Banana Peel",
                desc=("給予另一個角色你的一張裝備卡。"
                      "如果你沒有裝備卡，你受到1點傷害。"),
                color=CardType.Black,
                holder=None,
                is_equip=False,
                use=single_use.banana_peel
            ),
            card.Card(
                title="Dynamite",
                desc=("擲兩個骰子，對擲出總和所指定區域的所有角色"
                      "造成3點傷害"
                      "（如果擲出7則無事發生）。"),
                color=CardType.Black,
                holder=None,
                is_equip=False,
                use=single_use.dynamite
            ),
            card.Card(
                title="Spiritual Doll",
                desc=("選擇一個角色並擲六面骰。"
                      "如果點數為1到4，"
                      "你對該角色造成3點傷害。"
                      "如果點數為5或6，"
                      "你受到3點傷害。"),
                color=CardType.Black,
                holder=None,
                is_equip=False,
                use=single_use.spiritual_doll
            )
        ]
        # Initialize hermit cards
        hermit_cards = [
            card.Card(
                title="Hermit\'s Blackmail",
                desc=("我打賭你是中立或獵人陣營。如果是的話，"
                      "你必須給當前玩家一張裝備卡或受到1點傷害！"),
                color=CardType.Hermit,
                holder=None,
                is_equip=False,
                use=hermit.blackmail
            ),
            card.Card(
                title="Hermit\'s Blackmail",
                desc=("我打賭你是中立或獵人陣營。如果是的話，"
                      "你必須給當前玩家一張裝備卡或受到1點傷害！"),
                color=CardType.Hermit,
                holder=None,
                is_equip=False,
                use=hermit.blackmail
            ),
            card.Card(
                title="Hermit\'s Greed",
                desc=("我打賭你是中立或暗影陣營。如果是的話，"
                      "你必須給當前玩家一張裝備卡或受到1點傷害！"),
                color=CardType.Hermit,
                holder=None,
                is_equip=False,
                use=hermit.greed
            ),
            card.Card(
                title="Hermit\'s Greed",
                desc=("我打賭你是中立或暗影陣營。如果是的話，"
                      "你必須給當前玩家一張裝備卡或受到1點傷害！"),
                color=CardType.Hermit,
                holder=None,
                is_equip=False,
                use=hermit.greed
            ),
            card.Card(
                title="Hermit\'s Anger",
                desc=("我打賭你是獵人或暗影陣營。如果是的話，"
                      "你必須給當前玩家一張裝備卡或受到1點傷害！"),
                color=CardType.Hermit,
                holder=None,
                is_equip=False,
                use=hermit.anger
            ),
            card.Card(
                title="Hermit\'s Anger",
                desc=("我打賭你是獵人或暗影陣營。如果是的話，"
                      "你必須給當前玩家一張裝備卡或受到1點傷害！"),
                color=CardType.Hermit,
                holder=None,
                is_equip=False,
                use=hermit.anger
            ),
            card.Card(
                title="Hermit\'s Slap",
                desc="我打賭你是獵人陣營。如果是的話，你受到1點傷害！",
                color=CardType.Hermit,
                holder=None,
                is_equip=False,
                use=hermit.slap
            ),
            card.Card(
                title="Hermit\'s Slap",
                desc="我打賭你是獵人陣營。如果是的話，你受到1點傷害！",
                color=CardType.Hermit,
                holder=None,
                is_equip=False,
                use=hermit.slap
            ),
            card.Card(
                title="Hermit\'s Spell",
                desc="我打賭你是暗影陣營。如果是的話，你受到1點傷害！",
                color=CardType.Hermit,
                holder=None,
                is_equip=False,
                use=hermit.spell
            ),
            card.Card(
                title="Hermit\'s Exorcism",
                desc="我打賭你是暗影陣營。如果是的話，你受到2點傷害！",
                color=CardType.Hermit,
                holder=None,
                is_equip=False,
                use=hermit.exorcism
            ),
            card.Card(
                title="Hermit\'s Nurturance",
                desc=("我打賭你是中立陣營。如果是的話，你治療1點傷害！"
                      "（但是，如果你沒有受傷，"
                      "則你受到1點傷害！）"),
                color=CardType.Hermit,
                holder=None,
                is_equip=False,
                use=hermit.nurturance
            ),
            card.Card(
                title="Hermit\'s Aid",
                desc=("我打賭你是獵人陣營。如果是的話，你治療1點傷害！"
                      "（但是，如果你沒有受傷，"
                      "則你受到1點傷害！）"),
                color=CardType.Hermit,
                holder=None,
                is_equip=False,
                use=hermit.aid
            ),
            card.Card(
                title="Hermit\'s Huddle",
                desc=("我打賭你是暗影陣營。如果是的話，你治療1點傷害！"
                      "（但是，如果你沒有受傷，"
                      "則你受到1點傷害！）"),
                color=CardType.Hermit,
                holder=None,
                is_equip=False,
                use=hermit.huddle
            ),
            card.Card(
                title="Hermit\'s Lesson",
                desc=("我打賭你的最大生命值是12或以上。"
                      "如果是的話，你受到2點傷害！"),
                color=CardType.Hermit,
                holder=None,
                is_equip=False,
                use=hermit.lesson
            ),
            card.Card(
                title="Hermit\'s Bully",
                desc=("我打賭你的最大生命值是11或以下。"
                      "如果是的話，你受到1點傷害！"),
                color=CardType.Hermit,
                holder=None,
                is_equip=False,
                use=hermit.bully
            ),
            card.Card(
                title="Hermit\'s Prediction",
                desc=("你必須秘密地向當前玩家揭露"
                      "你的角色資訊！"),
                color=CardType.Hermit,
                holder=None,
                is_equip=False,
                use=hermit.prediction
            )
        ]
        # Initialize white, black, hermit decks
        self.WHITE_DECK = deck.Deck(cards=white_cards)
        self.BLACK_DECK = deck.Deck(cards=black_cards)
        self.HERMIT_DECK = deck.Deck(cards=hermit_cards)

        # Initialize characters
        self.CHARACTERS = [
            character.Character(
                name="Valkyrie",
                alleg=Alleg.Shadow,
                max_damage=13,
                win_cond=win_conditions.shadow,
                win_cond_desc="所有獵人（或3個中立）死亡。",
                special=specials.valkyrie,
                special_desc=("當你攻擊時，你只擲四面骰並造成等同於"
                            "擲骰點數的傷害。"),
                resource_id="valkyrie"
            ),
            character.Character(
                name="Vampire",
                alleg=Alleg.Shadow,
                max_damage=13,
                win_cond=win_conditions.shadow,
                win_cond_desc="所有獵人（或3個中立）死亡。",
                special=specials.vampire,
                special_desc=("如果你攻擊一名玩家並造成傷害，"
                            "你治療自己2點傷害。"),
                resource_id="vampire"
            ),
            character.Character(
                name="Werewolf",
                alleg=Alleg.Shadow,
                max_damage=14,
                win_cond=win_conditions.shadow,
                win_cond_desc="所有獵人（或3個中立）死亡。",
                special=specials.werewolf,
                special_desc=("在你被攻擊後，你可以立即反擊。"),
                resource_id="werewolf"
            ),
            character.Character(
                name="Ultra Soul",
                alleg=Alleg.Shadow,
                max_damage=11,
                win_cond=win_conditions.shadow,
                win_cond_desc="所有獵人（或3個中立）死亡。",
                special=specials.ultra_soul,
                special_desc=("在你的回合開始時，你可以對一名在冥界之門的"
                            "玩家造成3點傷害。"),
                resource_id="ultra-soul"
            ),
            character.Character(
                name="Allie",
                alleg=Alleg.Neutral,
                max_damage=8,
                win_cond=win_conditions.allie,
                win_cond_desc="在遊戲結束時你沒有死亡。",
                special=specials.allie,
                special_desc="每局遊戲一次，你可以完全恢復你的生命值。",
                resource_id="allie"
            ),
            character.Character(
                name="Bob",
                alleg=Alleg.Neutral,
                max_damage=10,
                win_cond=win_conditions.bob,
                win_cond_desc="你擁有5張或更多裝備卡。",
                special=specials.bob,
                special_desc=("如果你的攻擊造成2點或更多傷害，"
                            "你可以改為偷取目標的一張裝備卡。"),
                resource_id="bob1",
                modifiers={'min_players': 4, 'max_players': 6}
            ),
            character.Character(
                name="Bob",
                alleg=Alleg.Neutral,
                max_damage=10,
                win_cond=win_conditions.bob,
                win_cond_desc="你擁有5張或更多裝備卡。",
                special=specials.bob,
                special_desc=("如果你殺死另一名玩家，"
                            "你可以拿取他們所有的裝備卡。"),
                resource_id="bob2",
                modifiers={'min_players': 7, 'max_players': 8}
            ),
            character.Character(
                name="Catherine",
                alleg=Alleg.Neutral,
                max_damage=11,
                win_cond=win_conditions.catherine,
                win_cond_desc=("你是第一個死亡的玩家或最後兩名"
                             "存活玩家之一。"),
                special=specials.catherine,
                special_desc="在你的回合開始時，你治療1點傷害。",
                resource_id="catherine"
            ),
            character.Character(
                name="George",
                alleg=Alleg.Hunter,
                max_damage=14,
                win_cond=win_conditions.hunter,
                win_cond_desc="所有暗影陣營死亡。",
                special=specials.george,
                special_desc=("每局遊戲一次，在你的回合開始時，你可以"
                            "選擇一名玩家並對其造成四面骰點數的傷害。"),
                resource_id="george"
            ),
            character.Character(
                name="Fu-ka",
                alleg=Alleg.Hunter,
                max_damage=12,
                win_cond=win_conditions.hunter,
                win_cond_desc="所有暗影陣營死亡。",
                special=specials.fuka,
                special_desc=("每局遊戲一次，在你的回合開始時，"
                            "你可以將任意玩家的傷害設為7。"),
                resource_id="fu-ka"
            ),
            character.Character(
                name="Franklin",
                alleg=Alleg.Hunter,
                max_damage=12,
                win_cond=win_conditions.hunter,
                win_cond_desc="所有暗影陣營死亡。",
                special=specials.franklin,
                special_desc=("每局遊戲一次，在你的回合開始時，你可以"
                            "選擇一名玩家並對其造成六面骰點數的傷害。"),
                resource_id="franklin"
            ),
            character.Character(
                name="Ellen",
                alleg=Alleg.Hunter,
                max_damage=10,
                win_cond=win_conditions.hunter,
                win_cond_desc="所有暗影陣營死亡。",
                special=specials.ellen,
                special_desc=("每局遊戲一次，在你的回合開始時，"
                            "你可以選擇一名玩家並永久失效他們的特殊能力。"),
                resource_id="ellen"
            )
        ]

        # Initialize areas
        self.AREAS = [
            area.Area(
                name="Hermit's Cabin",
                desc="抽一張隱者卡。",
                domain=[2, 3],
                action=lambda gc, player: player.drawCard(gc.hermit_cards),
                resource_id="hermits-cabin"
            ),
            area.Area(
                name="Underworld Gate",
                desc="從你選擇的牌堆中抽一張牌。",
                domain=[4, 5],
                action=area.underworld_gate_action,
                resource_id="underworld-gate"
            ),
            area.Area(
                name="Church",
                desc="抽一張白色卡牌。",
                domain=[6],
                action=lambda gc, player: player.drawCard(gc.white_cards),
                resource_id="church"
            ),
            area.Area(
                name="Cemetery",
                desc="抽一張黑色卡牌。",
                domain=[8],
                action=lambda gc, player: player.drawCard(gc.black_cards),
                resource_id="cemetery"
            ),
            area.Area(
                name="Weird Woods",
                desc="治療1點傷害或對任意玩家造成2點傷害。",
                domain=[9],
                action=area.weird_woods_action,
                resource_id="weird-woods"
            ),
            area.Area(
                name="Erstwhile Altar",
                desc="偷取任意玩家的一張裝備卡。",
                domain=[10],
                action=area.erstwhile_altar_action,
                resource_id="erstwhile-altar"
            )
        ]

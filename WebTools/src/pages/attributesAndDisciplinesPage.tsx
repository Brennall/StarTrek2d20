﻿import * as React from 'react';
import {character} from '../common/character';
import {Navigation} from '../common/navigator';
import {PageIdentity, IPageProperties} from './pageFactory';
import {AttributesHelper} from '../helpers/attributes';
import {Skill, SkillsHelper} from '../helpers/skills';
import {PageHeader} from '../components/pageHeader';
import {AttributeView} from '../components/attribute';
import {AttributeImprovementCollection, AttributeImprovementCollectionMode} from '../components/attributeImprovement';
import {SkillImprovementCollection} from '../components/skillImprovement';
import {ElectiveSkillList} from '../components/electiveSkillList';
import {Button} from '../components/button';
import {Dialog} from '../components/dialog';
import {ValueInput, Value} from '../components/valueInput';

interface IPageState {
    showExcessAttrDistribution: boolean;
    showExcessSkillDistribution: boolean;
}

export class AttributesAndDisciplinesPage extends React.Component<IPageProperties, IPageState> {
    private _attrPoints: number;
    private _excessAttrPoints: number;
    private _skillPoints: number;
    private _excessSkillPoints: number;
    private _skills: Skill[];
    private _attributesDone: boolean;
    private _skillsDone: boolean;

    constructor(props: IPageProperties) {
        super(props);

        this._attrPoints = 2;
        this._skillPoints = 2;
        this._skills = [];

        let attrSum = 0;
        let discSum = 0;

        character.attributes.forEach(a => {
            attrSum += a.value;
        });

        character.skills.forEach(s => {
            discSum += s.expertise;
        });

        this._excessAttrPoints = 54 - attrSum;
        this._excessSkillPoints = 14 - discSum;

        this.state = {
            showExcessAttrDistribution: this._excessAttrPoints > 0,
            showExcessSkillDistribution: this._excessSkillPoints > 0
        };
    }

    render() {
        const attributes = !this.state.showExcessAttrDistribution
            ? <AttributeImprovementCollection mode={AttributeImprovementCollectionMode.Customization} points={this._attrPoints} onDone={(done) => { this.attributesDone(done); } } />
            : this._excessAttrPoints > 0
                ? <AttributeImprovementCollection mode={AttributeImprovementCollectionMode.Increase} points={this._excessAttrPoints} onDone={(done) => { this.attributesDone(done); } } />
                : undefined;

        const disciplines = !this.state.showExcessSkillDistribution
            ? <ElectiveSkillList points={this._skillPoints} skills={character.skills.map(s => { return s.skill; }) } onUpdated={(skills) => { this._skillsDone = skills.length === this._skillPoints; } } />
            : <SkillImprovementCollection points={this._excessSkillPoints} skills={character.skills.map(s => s.skill) } onDone={(done) => { this._skillsDone = done; }} />;

        const hasExcess = this.state.showExcessAttrDistribution || this.state.showExcessSkillDistribution;

        const description = !hasExcess
            ? "At this stage, your character is almost complete, and needs only a few final elements and adjustments. This serves as a last chance to customize the character before play."
            : "You will now get a chance to spend any excess Attribute and/or Discipline points accumulated during your lifepath.";

        const value = !hasExcess
            ? <div className="panel">
                <div className="header-small">VALUE</div>
                <ValueInput value={Value.Finish}/>
              </div>
            : undefined;

        const buttonText = !hasExcess ? "FINISH" : "PROCEED";

        return (
            <div className="page">
                <div className="page-text">
                    {description}
                </div>
                <div className="panel">
                    <div className="header-small">{`ATTRIBUTES (POINTS: ${hasExcess ? this._excessAttrPoints : this._attrPoints})`}</div>
                    {attributes}
                </div>
                <div className="panel">
                    <div className="header-small">{`DISCIPLINES (POINTS: ${hasExcess ? this._excessSkillPoints : this._skillPoints})`}</div>
                    {disciplines}
                </div>
                {value}
                <Button text={buttonText} className="button-next" onClick={() => this.onNext() }/>
            </div>
        );
    }

    private attributesDone(done: boolean) {
        this._attributesDone = done;
    }

    private onNext() {
        if (this.state.showExcessAttrDistribution || this.state.showExcessSkillDistribution) {
            if (!this._attributesDone && this._excessAttrPoints > 0) {
                Dialog.show("You have not distributed all Attribute points.");
                return;
            }

            if (!this._skillsDone && this._excessSkillPoints > 0) {
                Dialog.show("You have not distributed all Discipline points.");
                return;
            }

            this.setState({ showExcessAttrDistribution: false, showExcessSkillDistribution: false });
        }
        else {
            if (!this._attributesDone) {
                Dialog.show("You have not distributed all Attribute points.");
                return;
            }

            if (!this._skillsDone) {
                Dialog.show("You have not distributed all Discipline points.");
                return;
            }

            Navigation.navigateToPage(PageIdentity.Finish);
        }
    }
}
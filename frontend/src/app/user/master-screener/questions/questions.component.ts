import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { MasterScreenerService } from '../master-screener.service';
import { QuestionControlService } from './question-control.service';
import { Question } from '../../../admin/models';
import { Animations } from '../../../shared/animations';


@Component({
    templateUrl: './questions.component.html',
    styleUrls: ['./questions.component.css'],
    providers: [QuestionControlService],
    animations: [
        Animations.flyinHalf
    ]
})
export class QuestionsComponent implements OnInit, OnDestroy {
    form: FormGroup;
    questions: Question[] = [];
    conditionalQuestions: Question[] = [];
    errorMessage = '';
    timeout;
    loading = false;

    constructor(
        public masterScreenerService: MasterScreenerService,
        private questionControlService: QuestionControlService,
        private router: Router,
        private route: ActivatedRoute,
    ) { }

    ngOnInit() {
        const data = this.route.snapshot.data['questions'];
        if (data.error !== undefined) {
            this.errorMessage = 'unable to load data from server, please try later.';
        }
        this.questions = data.questions || [];
        this.conditionalQuestions = data.conditionalQuestions || [];
        try {
            this.form = this.questionControlService.toFormGroup(this.questions);
        } catch (error) {
            console.error(error);
            this.errorMessage = 'internal program error, please contact admin.';
        }
    }

    ngOnDestroy() {
        clearTimeout(this.timeout);
    }

    onSubmit() {
        this.timeout = setTimeout(() => this.loading = true, 60);
        this.masterScreenerService.loadResults(this.form)
            .then(results => this.masterScreenerService.results = [...results])
            .then(() => this.router.navigateByUrl('/master-screener/results'))
            .catch(() => this.errorMessage = 'unable to load results, try later.');
    }

    idsToKeys(ids) {
        return this.conditionalQuestions.filter(q => ids.includes(q.id)).map(q => {
            return q.controlType !== 'Multiselect' ? q.key : q.multiSelectOptions.map(q => q.key.name);
        });
    }

    addControls(questionMessage) {
        const { id, conditionals} = questionMessage;

        this.idsToKeys(conditionals).forEach(key => {
            if (!Array.isArray(key)) {
                this.form.addControl(key, new FormControl());
            } else {
                key.forEach(k => this.form.addControl(k, new FormControl()));
            }

        });
    }

    removeControls(questionMessage) {
        const { id, conditionals } = questionMessage;

        this.idsToKeys(conditionals).forEach(key => {
            if (!Array.isArray(key)){
                this.form.removeControl(key)
            } else {
                key.forEach(k => this.form.removeControl(k));
            }
        });
    }

    gatherConditionals(question: Question) {
        if (!question.expandable || question.conditionalQuestions.length === 0) {
            return [];
        }
        const conditionals = question.conditionalQuestions;
        return this.conditionalQuestions.filter(q => conditionals.includes(q.id));
    }

    getQuestion(id): Question {
        return [...this.questions, ...this.conditionalQuestions].find(q => q.id === id);
    }

}

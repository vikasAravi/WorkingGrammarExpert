from django.shortcuts import render
from django.contrib.auth.decorators import login_required
#from django.contrib.auth.mixins import
from django.views.generic import ListView
# Create your views here.
from django.urls import reverse_lazy
from django.views import generic
from . forms import MyUserCreationForm, AnswerForm
from . models import Question, Answer
from django.http import HttpResponse
from .checker.report import Report
import json
#from . misc import score_calculator


class SignUp(generic.CreateView):
    form_class = MyUserCreationForm
    success_url = reverse_lazy('login')
    template_name = 'signup.html'


class QuestionsListView(ListView):
    template_name = "home.html"
    model = Question


def HomePage_view(request):
    return render(request,template_name="homepage.html")

# class AnswerView(generic.CreateView):
#     model = Answer
#     fields = ["answer"]
#
#     def form_valid(self, form):
#         answer_object = form.save(commit=False)
#         answer_object.user = self.request.user
#         answer_object.question =

@login_required(login_url="login")
def answer_view(request, qid):
    # case where question doesn't exist? return a 404 error
    context = {"submitted": False, "question": Question.objects.get(pk=qid), "paused_time": '', "results": None}
    if request.method == "POST":
        # print("IN POST")
        form = AnswerForm(request.POST)
        if form.is_valid():
            # print("IN POST")
            # print(form)
            context["submitted"] = True
            context["paused_time"] = form.cleaned_data["paused_time"]  #
            answer_object = form.save(commit=False)
            answer_object.user = request.user
            answer_object.question = context["question"]
           # answer_object.score = results["score"]
            answer_object.save()
    else:
        form = AnswerForm()
        # print("IN GET")
    context["form"] = form
    # print(request.method,context)
    return render(request, template_name="answer.html", context=context)


def fetch_results(request):
    if request.method == "GET":
         return HttpResponse("hey") 
    if request.method == "POST":
        d = Report(request.POST['essay']).reprJSON()
        return HttpResponse(json.dumps(d))
    #return render(request,template_name="answer.html",context={"obj":json.dumps(d)})

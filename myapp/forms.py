from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.contrib.auth.models import User
from . models import Answer


class MyUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ["username", "email", "password1", "password2"]

    def save(self, commit=True):
        user = super(MyUserCreationForm, self).save(commit=False)
        user.email = self.cleaned_data["email"]
        print(user.password)
        if commit:
            user.save()
        return user


class AnswerForm(forms.ModelForm):
    class Meta:
        model = Answer
        fields = ["answer"]
    paused_time = forms.CharField(widget=forms.HiddenInput)

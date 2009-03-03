require 'test_helper'

class TutorsControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:tutors)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create tutor" do
    assert_difference('Tutor.count') do
      post :create, :tutor => { }
    end

    assert_redirected_to tutor_path(assigns(:tutor))
  end

  test "should show tutor" do
    get :show, :id => tutors(:one).id
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => tutors(:one).id
    assert_response :success
  end

  test "should update tutor" do
    put :update, :id => tutors(:one).id, :tutor => { }
    assert_redirected_to tutor_path(assigns(:tutor))
  end

  test "should destroy tutor" do
    assert_difference('Tutor.count', -1) do
      delete :destroy, :id => tutors(:one).id
    end

    assert_redirected_to tutors_path
  end
end

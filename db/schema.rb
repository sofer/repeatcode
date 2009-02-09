# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20090206084434) do

  create_table "areas", :force => true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "authorships", :force => true do |t|
    t.integer  "subject_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "courses", :force => true do |t|
    t.integer  "subject_id"
    t.integer  "target"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "last_question"
    t.boolean  "archived"
  end

  create_table "exercises", :force => true do |t|
    t.integer  "topic_id"
    t.integer  "position"
    t.string   "description"
    t.string   "phrase"
    t.string   "response"
    t.string   "pattern"
    t.text     "notes"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "hint"
    t.string   "insert"
  end

  create_table "intervals", :force => true do |t|
    t.integer  "course_id"
    t.integer  "index_no"
    t.integer  "minutes"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "lessons", :force => true do |t|
    t.integer  "course_id"
    t.integer  "correct_responses"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "total_questions_started"
  end

  create_table "questions", :force => true do |t|
    t.integer  "course_id"
    t.integer  "exercise_id"
    t.integer  "current_interval"
    t.datetime "next_datetime"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "responses", :force => true do |t|
    t.integer  "question_id"
    t.integer  "lesson_id"
    t.integer  "seconds_taken"
    t.integer  "interval"
    t.string   "content"
    t.string   "result"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "subjects", :force => true do |t|
    t.string   "name"
    t.boolean  "public"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "archived"
    t.integer  "area_id"
    t.string   "extended_chars"
  end

  create_table "subscriptions", :force => true do |t|
    t.integer  "course_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "topics", :force => true do |t|
    t.integer  "subject_id"
    t.string   "name"
    t.integer  "position"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "code"
    t.text     "data"
    t.boolean  "add_together"
  end

  create_table "users", :force => true do |t|
    t.string   "login",                     :limit => 40
    t.string   "name",                      :limit => 100, :default => ""
    t.string   "email",                     :limit => 100
    t.string   "crypted_password",          :limit => 40
    t.string   "salt",                      :limit => 40
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "remember_token",            :limit => 40
    t.datetime "remember_token_expires_at"
  end

  add_index "users", ["login"], :name => "index_users_on_login", :unique => true

end
